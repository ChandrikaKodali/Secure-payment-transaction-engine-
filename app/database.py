from contextlib import contextmanager
import psycopg2
from psycopg2.extras import RealDictCursor
from app.config import get_settings


@contextmanager
def get_connection():
    settings = get_settings()
    conn = psycopg2.connect(
        host=settings.db_host,
        port=settings.db_port,
        database=settings.db_name,
        user=settings.db_user,
        password=settings.db_password,
    )
    try:
        yield conn
    finally:
        conn.close()


@contextmanager
def get_cursor():
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            yield conn, cursor
