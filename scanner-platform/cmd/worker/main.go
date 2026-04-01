package main

import (
    "context"
    "log"
    "fmt"
    "os"
    "sync"

    "scanner-platform/internal/queue"
    "scanner-platform/internal/worker"
)

func main() {
    ctx := context.Background()
    addr := os.Getenv("REDIS_ADDR")
    if addr == "" {
        addr = "redis:6379"
    }

    q := queue.New(addr)

    log.Println("Scanner worker started")

    var wg sync.WaitGroup

    // Goroutine 1: Poll scan_queue (blocks until a job arrives)
    wg.Add(1)
    go func() {
        defer wg.Done()
        for {
            job, err := q.Pop(ctx)
            if err != nil {
                log.Println("Scan queue error:", err)
                continue
            }

            result, err := worker.Run(ctx, job)
            if err != nil {
                log.Println("Scan worker error:", err)
                continue
            }

            fmt.Printf("Scan webhook response: %v\n", result)
        }
    }()

    // Goroutine 2: Poll fix_queue (polls every 2 seconds)
    wg.Add(1)
    go func() {
        defer wg.Done()
        for {
            fixJob, err := q.PopFix(ctx)
            if err != nil {
                log.Println("Fix queue error:", err)
                continue
            }
            if fixJob == nil {
                // No fix jobs available, loop again
                continue
            }

            err = worker.RunFix(ctx, fixJob)
            if err != nil {
                log.Println("Fix worker error:", err)
                continue
            }

            fmt.Printf("Fix processed: scan=%s type=%s\n", fixJob.ScanID, fixJob.FixType)
        }
    }()

    wg.Wait()
}