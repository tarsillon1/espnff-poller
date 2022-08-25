import { SQS } from "aws-sdk";

const outQueueName = process.env.OUT_QUEUE_NAME as string;

const sqs = new SQS();

const outQueueUrlPromise = sqs
  .getQueueUrl({ QueueName: outQueueName })
  .promise()
  .then(({ QueueUrl }) => QueueUrl || "")
  .catch((err) => {
    console.error("failed to get queue: ", err);
    return "";
  });

export const sendMessage = async (msg: object) => {
  const body = Buffer.from(JSON.stringify(msg)).toString("base64");
  const outQueueUrl = await outQueueUrlPromise;
  return sqs
    .sendMessage({ QueueUrl: outQueueUrl, MessageBody: body })
    .promise();
};
