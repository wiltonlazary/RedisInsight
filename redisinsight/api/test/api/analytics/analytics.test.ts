import {
  expect,
  describe,
  it,
  deps,
  requirements,
} from '../deps';
const { analytics } = deps;


describe('Analytics', () => {
  requirements('rte.serverType=local');

  it('APPLICATION_STARTED', () => {
    const appStarted = analytics.findEvent({
      event: 'APPLICATION_STARTED',
    })

    const appFirstStarted = analytics.findEvent({
      event: 'APPLICATION_FIRST_START',
    })

    const found = appStarted || appFirstStarted;

    if (!found) {
      fail('APPLICATION_STARTED or APPLICATION_FIRST_START events were not found');
    }

    expect(found?.properties).to.have.all.keys('appVersion', 'osPlatform', 'buildType');
    expect(found?.properties?.appVersion).to.be.a('string');
    expect(found?.properties?.osPlatform).to.be.a('string');
    expect(found?.properties?.buildType).to.be.a('string');
  });
});
