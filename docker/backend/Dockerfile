# Use a base image with torch, opencv, and torchvision pre-installed
FROM pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime AS builder

RUN apt-get update && apt-get install --yes --no-install-recommends \
    g++ libssl-dev libgl1 libglx-mesa0 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/* && \
    pip install --upgrade pip && pip install poetry && \
    rm -rf /root/.cache/pip

RUN poetry config virtualenvs.in-project false

RUN poetry config virtualenvs.create false

WORKDIR /app

COPY ./docker/backend/entrypoint.sh /entrypoint.sh

COPY ./backend/pyproject.toml ./

RUN poetry install

COPY ./backend ./

RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
