import getViewerJsonFromRedisSession from './session-decoder'

it('can not decode an empty session', () => {
  expect(getViewerJsonFromRedisSession('')).toBe(null)
})

it('can not decode a session without json separator', () => {
  expect(getViewerJsonFromRedisSession('toto')).toBe(null)
})

it('can decode a session with json separator', () => {
  const session =
    '_sf2_attributes|a:2:{s:8:"theToken";s:617:"a:3:{i:0;N;i:1;s:4:"main";i:2;a:5:{i:0;C:28:"CapcoUserBundleEntityUser":196:{a:8:{i:0;s:60:"$2y$12$PNJXUUnSzW8wpqLTHVloH.u2icbevOD1Mn73TlYORRnSJQsRddm6.";i:1;N;i:2;s:5:"admin";i:3;s:5:"admin";i:4;b:1;i:5;s:9:"userAdmin";i:6;s:14:"admin@test.com";i:7;s:14:"admin@test.com";}}i:1;b:1;i:2;a:2:{i:0;O:41:"SymfonyComponentSecurityCoreRoleRole":1:{s:47:"SymfonyComponentSecurityCoreRoleRolerole";s:10:"ROLE_ADMIN";}i:1;O:41:"SymfonyComponentSecurityCoreRoleRole":1:{s:47:"SymfonyComponentSecurityCoreRoleRolerole";s:9:"ROLE_USER";}}i:3;a:0:{}i:4;a:2:{i:0;s:10:"ROLE_ADMIN";i:1;s:9:"ROLE_USER";}}}";s:14:"_security_main";s:697:"O:74:"SymfonyComponentSecurityCoreAuthenticationTokenUsernamePasswordToken":3:{i:0;N;i:1;s:4:"main";i:2;a:5:{i:0;C:28:"CapcoUserBundleEntityUser":196:{a:8:{i:0;s:60:"$2y$12$PNJXUUnSzW8wpqLTHVloH.u2icbevOD1Mn73TlYORRnSJQsRddm6.";i:1;N;i:2;s:5:"admin";i:3;s:5:"admin";i:4;b:1;i:5;s:9:"userAdmin";i:6;s:14:"admin@test.com";i:7;s:14:"admin@test.com";}}i:1;b:1;i:2;a:2:{i:0;O:41:"SymfonyComponentSecurityCoreRoleRole":1:{s:47:"SymfonyComponentSecurityCoreRoleRolerole";s:10:"ROLE_ADMIN";}i:1;O:41:"SymfonyComponentSecurityCoreRoleRole":1:{s:47:"SymfonyComponentSecurityCoreRoleRolerole";s:9:"ROLE_USER";}}i:3;a:0:{}i:4;a:2:{i:0;s:10:"ROLE_ADMIN";i:1;s:9:"ROLE_USER";}}}";}_sf2_meta|a:3:{s:1:"u";i:1627579277;s:1:"c";i:1627579277;s:1:"l";s:7:"7200";}___JSON_SESSION_SEPARATOR__{"viewer":{"email":"user@email.com","username":"user","id":"VXNlcjoxMjM0","isAdmin":true,"isSuperAdmin":true,"isProjectAdmin":true}}'
  expect(getViewerJsonFromRedisSession(session)).toEqual({
    email: 'user@email.com',
    username: 'user',
    id: 'VXNlcjoxMjM0',
    isAdmin: true,
    isSuperAdmin: true,
    isProjectAdmin: true,
  })
})
