import os
import redis
import json


class RedisClient:
    def __init__(
        self,
        host: str | None = None,
        port: int | None = None,
        db: int = 0,
        decode_responses: bool = True,
    ):
        host = host or os.getenv("REDIS_HOST", "localhost")
        port = port if port is not None else int(os.getenv("REDIS_PORT", "6379"))
        self.redis = redis.Redis(host=host, port=port, db=db, decode_responses=decode_responses)


    def PushToQueue(self, queue_name: str = "scan_queue", data: dict = {}):
        self.redis.lpush(queue_name, json.dumps(data))

    def PopFromQueue(self, queue_name: str = "scan_queue"):
        return self.redis.brpop(queue_name)  