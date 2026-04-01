package queue

import (
    "context"
    "encoding/json"
    "time"

    "github.com/redis/go-redis/v9"
    "scanner-platform/internal/models"
)

type Queue struct {
    rdb *redis.Client
    key string
}

func New(addr string) *Queue {
    return &Queue{
        rdb: redis.NewClient(&redis.Options{Addr: addr}),
        key: "scan_queue",
    }
}

func (q *Queue) Pop(ctx context.Context) (*models.ScanJob, error) {
    res, err := q.rdb.BRPop(ctx, 0, q.key).Result()
    if err != nil {
        return nil, err
    }

    var job models.ScanJob
    err = json.Unmarshal([]byte(res[1]), &job)
    return &job, err
}

func (q *Queue) PopFix(ctx context.Context) (*models.FixJob, error) {
    res, err := q.rdb.BRPop(ctx, 2*time.Second, "fix_queue").Result()
    if err == redis.Nil {
        return nil, nil // no fix jobs available
    }
    if err != nil {
        return nil, err
    }

    var job models.FixJob
    err = json.Unmarshal([]byte(res[1]), &job)
    return &job, err
}

func (q *Queue) Push(ctx context.Context, job *models.ScanJob) error {
    data, err := json.Marshal(job)
    if err != nil {
        return err
    }
    return q.rdb.LPush(ctx, q.key, data).Err()
}
   