import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_MANAGED_USERS,
  SAMPLE_TEST_USERS,
  INITIAL_APP_RELEASES,
  toggleUserVerification,
  toggleUserSuspension,
  filterAdminUsers,
  createNewAppRelease,
  toggleMaintenanceMode,
  SystemStatus,
  isFounderOwner,
  isFounderEmail,
  isFounderFullyUnlocked,
  validateFounderSecurityPin,
  checkFounderAccess,
} from './admin';

test('INITIAL_MANAGED_USERS starts empty with zero hardcoded users', () => {
  assert.equal(INITIAL_MANAGED_USERS.length, 0);
});

test('toggleUserVerification toggles isVerified correctly', () => {
  const user = SAMPLE_TEST_USERS.find((u) => u.id === 'user-aman')!;
  assert.equal(user.isVerified, false);

  const updated = toggleUserVerification(SAMPLE_TEST_USERS, 'user-aman');
  const amanUpdated = updated.find((u) => u.id === 'user-aman')!;
  assert.equal(amanUpdated.isVerified, true);

  const toggledBack = toggleUserVerification(updated, 'user-aman');
  assert.equal(toggledBack.find((u) => u.id === 'user-aman')!.isVerified, false);
});

test('toggleUserSuspension suspends and un-suspends with reason', () => {
  const user = SAMPLE_TEST_USERS.find((u) => u.id === 'user-vikram')!;
  assert.equal(user.isSuspended, false);

  const updated = toggleUserSuspension(SAMPLE_TEST_USERS, 'user-vikram', 'Terms violation');
  const suspendedUser = updated.find((u) => u.id === 'user-vikram')!;
  assert.equal(suspendedUser.isSuspended, true);
  assert.equal(suspendedUser.suspensionReason, 'Terms violation');

  const unbanned = toggleUserSuspension(updated, 'user-vikram');
  const activeUser = unbanned.find((u) => u.id === 'user-vikram')!;
  assert.equal(activeUser.isSuspended, false);
  assert.equal(activeUser.suspensionReason, undefined);
});

test('filterAdminUsers filters by query and categories', () => {
  const testList = [...SAMPLE_TEST_USERS];
  const amanMatch = filterAdminUsers(testList, 'Aman', 'all');
  assert.equal(amanMatch.length, 1);
  assert.equal(amanMatch[0].id, 'user-aman');

  const verified = filterAdminUsers(testList, '', 'verified');
  assert.ok(verified.length >= 1);
  assert.ok(verified.every((u) => u.isVerified));

  const bots = filterAdminUsers(testList, '', 'bots');
  assert.ok(bots.some((u) => u.role === 'bot'));
});

test('createNewAppRelease prepends new version with changelog and commit hash', () => {
  const updatedReleases = createNewAppRelease(
    INITIAL_APP_RELEASES,
    '2.5.0',
    ['Ultra-fast video player', 'New creator dashboard']
  );

  assert.equal(updatedReleases.length, INITIAL_APP_RELEASES.length + 1);
  assert.equal(updatedReleases[0].version, 'v2.5.0');
  assert.equal(updatedReleases[0].changelog.length, 2);
  assert.equal(updatedReleases[0].status, 'production');
  assert.ok(updatedReleases[0].buildCommit.length >= 6);
});

test('toggleMaintenanceMode correctly toggles state and notice', () => {
  const initialStatus: SystemStatus = {
    totalUsersCount: 0,
    activeConcurrentStreams: 0,
    aiBotsBlockedCount: 0,
    cloudRunInstancesActive: 1,
    cdnHitRatioPercent: 100,
    maintenanceMode: false,
    maintenanceNotice: '',
  };

  const enabled = toggleMaintenanceMode(initialStatus, 'Upgrading servers');
  assert.equal(enabled.maintenanceMode, true);
  assert.equal(enabled.maintenanceNotice, 'Upgrading servers');

  const disabled = toggleMaintenanceMode(enabled);
  assert.equal(disabled.maintenanceMode, false);
  assert.equal(disabled.maintenanceNotice, '');
});

test('isFounderOwner requires verified Google Auth AND founder email and blocks spoofing', () => {
  assert.equal(
    isFounderOwner({
      email: 'ravimaske8888@gmail.com',
      isGoogleUser: true,
      emailVerified: true,
    }),
    true
  );
  assert.equal(
    isFounderOwner({
      email: 'RAVIMASKE8888@GMAIL.COM',
      isGoogleUser: true,
      emailVerified: true,
    }),
    true
  );
  // Spoof protection: unverified email or non-Google user must NEVER pass
  assert.equal(
    isFounderOwner({
      email: 'ravimaske8888@gmail.com',
      isGoogleUser: true,
      emailVerified: false,
    }),
    false
  );
  assert.equal(
    isFounderOwner({
      email: 'ravimaske8888@gmail.com',
      isGoogleUser: false,
      emailVerified: true,
    }),
    false
  );
  assert.equal(
    isFounderOwner({
      email: 'other@gmail.com',
      isGoogleUser: true,
      emailVerified: true,
    }),
    false
  );
  assert.equal(isFounderOwner(null), false);
  assert.equal(isFounderOwner(undefined), false);
  assert.equal(isFounderEmail('ravimaske8888@gmail.com'), true);
  assert.equal(isFounderEmail('other@gmail.com'), false);
});

test('validateFounderSecurityPin validates default and custom PIN', () => {
  assert.equal(validateFounderSecurityPin('8888'), true);
  assert.equal(validateFounderSecurityPin('1234'), false);
  assert.equal(validateFounderSecurityPin('9999', '9999'), true);
});

test('isFounderFullyUnlocked requires BOTH verified Google founder account AND Master PIN', () => {
  const verifiedFounder = {
    email: 'ravimaske8888@gmail.com',
    isGoogleUser: true,
    emailVerified: true,
  };
  const regularUser = {
    email: 'user@gmail.com',
    isGoogleUser: true,
    emailVerified: true,
  };

  assert.equal(isFounderFullyUnlocked(null, true), false);
  assert.equal(isFounderFullyUnlocked(regularUser, true), false);
  assert.equal(isFounderFullyUnlocked(verifiedFounder, false), false);
  assert.equal(isFounderFullyUnlocked(verifiedFounder, true), true);
});

test('checkFounderAccess strictly blocks unauthorized users and gates PIN for verified Founder', () => {
  const unauthorized = checkFounderAccess({
    email: 'random@test.com',
    isGoogleUser: true,
    emailVerified: true,
  });
  assert.equal(unauthorized.allowed, false);
  assert.equal(unauthorized.status, 'unauthorized');

  const unverifiedFounder = checkFounderAccess({
    email: 'ravimaske8888@gmail.com',
    isGoogleUser: true,
    emailVerified: false,
  });
  assert.equal(unverifiedFounder.allowed, false);
  assert.equal(unverifiedFounder.status, 'unauthorized');

  const verifiedFounder = {
    email: 'ravimaske8888@gmail.com',
    isGoogleUser: true,
    emailVerified: true,
  };

  const founderNeedPin = checkFounderAccess(verifiedFounder);
  assert.equal(founderNeedPin.allowed, false);
  assert.equal(founderNeedPin.status, 'pin_required');

  const founderWrongPin = checkFounderAccess(verifiedFounder, '1234');
  assert.equal(founderWrongPin.allowed, false);
  assert.equal(founderWrongPin.status, 'pin_required');

  const founderWithPin = checkFounderAccess(verifiedFounder, '8888');
  assert.equal(founderWithPin.allowed, true);
  assert.equal(founderWithPin.status, 'authorized');

  const founderSession = checkFounderAccess(verifiedFounder, undefined, true);
  assert.equal(founderSession.allowed, true);
  assert.equal(founderSession.status, 'authorized');
});
