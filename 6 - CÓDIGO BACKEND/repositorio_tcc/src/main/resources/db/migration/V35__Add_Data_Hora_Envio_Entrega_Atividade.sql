ALTER TABLE entrega_atividade
ADD COLUMN data_hora_envio TIMESTAMP;

UPDATE entrega_atividade
SET data_hora_envio = data_realizacao::timestamp
WHERE data_hora_envio IS NULL
  AND data_realizacao IS NOT NULL;