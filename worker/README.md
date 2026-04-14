# Worker (Phase 1+)

This package will host background jobs (reminder dispatch, progress aggregation) using a Redis-backed queue.

Phase 0 intentionally does not include a runnable worker process. Keep long-running work out of the API request lifecycle.
