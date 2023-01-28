import {
  IvsClient,
  CreateChannelCommand,
  GetChannelCommand,
  GetStreamKeyCommand,
  ListStreamKeysCommand,
  StopStreamCommand,
} from '@aws-sdk/client-ivs';

import { validateEnv } from './validate';

validateEnv(['AWS_ACCESS_KEY', 'AWS_SECRET_KEY']);

const client = new IvsClient({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
}); //create environment variable for region

// creates a channel, creates a stream key, returns info for both
export async function startStream() {
  const command = new CreateChannelCommand({
    name: 'test',
    latencyMode: 'NORMAL',
    type: 'STANDARD',
    authorized: false,
  });
  const response = await client.send(command);
  return response;
}

// gets stream info, stream key
export async function getStreamInfo(channelArn: string) {
  const channelCommand = new GetChannelCommand({ arn: channelArn });
  const streamKeyCommand = new ListStreamKeysCommand({ channelArn });

  const [channel, streamKeyResponse] = await Promise.all([
    client.send(channelCommand),
    client.send(streamKeyCommand),
  ]);

  const streamKeySummary = streamKeyResponse.streamKeys[0];

  const getStreamKeyCommand = new GetStreamKeyCommand({ arn: streamKeySummary.arn });
  const streamKey = await client.send(getStreamKeyCommand);

  return {
    channel,
    streamKey,
  };
}

export async function endStream(arn: string) {
  //stop the stream
  const command = new StopStreamCommand({ channelArn: arn });
  const response = await client.send(command);
  return response;
}
