import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as bodyParser from 'body-parser';
import { constants } from './constants';
import { connect, Socket } from "socket.io-client";
import * as express from 'express';
import { serverConfig } from './test';

/**
 * TEST_BE_SERVER - url to already running API that we want to test
 * When not defined We will up and run local server
 */
export let server = process.env.TEST_BE_SERVER;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // lgtm[js/disabling-certificate-validation]

export let baseUrl = server;

/**
 * Initiate server if needed (only once)
 */
export const getServer = async () => {
  try {
    const keytar = require('keytar');
    let keytarPassword = await keytar.getPassword('redisinsight', 'app');
    if (!keytarPassword) {
      await keytar.setPassword('redisinsight', 'app', constants.TEST_KEYTAR_PASSWORD);
    }
    else {
      constants.TEST_KEYTAR_PASSWORD = keytarPassword;
    }
  } catch (e) {
    constants.TEST_ENCRYPTION_STRATEGY = 'PLAIN';
  }

  if (!server) {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.use(bodyParser.json({ limit: '512mb' }));
    app.use(bodyParser.urlencoded({ limit: '512mb', extended: true }));
    app.use('/static', express.static(serverConfig.get('dir_path').staticDir))

    await app.init();
    server = await app.getHttpServer();

    await app.listen(0, '0.0.0.0');
    baseUrl = await app.getUrl();
  }

  return server;
}

export const getBaseURL = (): string => baseUrl;

export const getSocket = async (namespace: string, options = {}): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    const base = new URL(baseUrl);
    const client = connect(`ws${base.protocol === 'https:' ? 's' : ''}://${base.host}/${namespace}`, {
      forceNew: true,
      rejectUnauthorized: false,
      ...options,
    });
    client.on('connect_error', reject);
    client.on('connect', () => resolve(client));
  });
}
