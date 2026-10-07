"""S3/MinIO access for the worker (download inputs, upload outputs)."""
import boto3
from botocore.config import Config
from . import config


def _client():
    return boto3.client(
        "s3",
        endpoint_url=config.S3_ENDPOINT,
        region_name=config.S3_REGION,
        aws_access_key_id=config.S3_ACCESS_KEY,
        aws_secret_access_key=config.S3_SECRET_KEY,
        config=Config(s3={"addressing_style": "path" if config.S3_FORCE_PATH_STYLE else "virtual"}),
    )


def download(key: str) -> bytes:
    obj = _client().get_object(Bucket=config.S3_BUCKET, Key=key)
    body = obj["Body"].read()
    if len(body) > config.MAX_INPUT_BYTES:
        raise ValueError("Input exceeds worker size limit.")
    return body


def upload(key: str, data: bytes, content_type: str) -> None:
    _client().put_object(
        Bucket=config.S3_BUCKET, Key=key, Body=data, ContentType=content_type
    )
