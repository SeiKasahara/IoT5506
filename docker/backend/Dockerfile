FROM python:3.12-slim

RUN apt-get update && apt-get install --yes --no-install-recommends postgresql-client g++ libssl-dev && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip && pip install poetry

RUN poetry config virtualenvs.in-project false
RUN poetry config virtualenvs.create false

WORKDIR /app

COPY ./docker/backend/entrypoint.sh /entrypoint.sh

COPY ./backend/pyproject.toml ./

RUN poetry install

COPY ./backend ./

RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]