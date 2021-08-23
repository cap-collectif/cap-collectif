<?php

namespace spec\Capco\UserBundle\Security;

use Capco\UserBundle\Security\SessionWithJsonHandler;

use PhpSpec\ObjectBehavior;
use Predis\ClientInterface;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Security as SymfonySecurity;

class SessionWithJsonHandlerSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(SessionWithJsonHandler::class);
    }

    public function let(ClientInterface $redis, SymfonySecurity $security)
    {
        $this->beConstructedWith($redis, $security, [], '', true);
    }

    public function it_match(User $viewer) {
        $sessionData = '_sf2_attributes|a:2:{s:8:"theToken";s:617:"a:3:{i:0;N;i:1;s:4:"main";i:2;a:5:{i:0;C:28:"Capco\UserBundle\Entity\User":196:{a:8:{i:0;s:60:"$2y$12$PNJXUUnSzW8wpqLTHVloH.u2icbevOD1Mn73TlYORRnSJQsRddm6.";i:1;N;i:2;s:5:"admin";i:3;s:5:"admin";i:4;b:1;i:5;s:9:"userAdmin";i:6;s:14:"admin@test.com";i:7;s:14:"admin@test.com";}}i:1;b:1;i:2;a:2:{i:0;O:41:"Symfony\Component\Security\Core\Role\Role":1:{s:47:"Symfony\Component\Security\Core\Role\Rolerole";s:10:"ROLE_ADMIN";}i:1;O:41:"Symfony\Component\Security\Core\Role\Role":1:{s:47:"Symfony\Component\Security\Core\Role\Rolerole";s:9:"ROLE_USER";}}i:3;a:0:{}i:4;a:2:{i:0;s:10:"ROLE_ADMIN";i:1;s:9:"ROLE_USER";}}}";s:14:"_security_main";s:697:"O:74:"Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken":3:{i:0;N;i:1;s:4:"main";i:2;a:5:{i:0;C:28:"Capco\UserBundle\Entity\User":196:{a:8:{i:0;s:60:"$2y$12$PNJXUUnSzW8wpqLTHVloH.u2icbevOD1Mn73TlYORRnSJQsRddm6.";i:1;N;i:2;s:5:"admin";i:3;s:5:"admin";i:4;b:1;i:5;s:9:"userAdmin";i:6;s:14:"admin@test.com";i:7;s:14:"admin@test.com";}}i:1;b:1;i:2;a:2:{i:0;O:41:"Symfony\Component\Security\Core\Role\Role":1:{s:47:"Symfony\Component\Security\Core\Role\Rolerole";s:10:"ROLE_ADMIN";}i:1;O:41:"Symfony\Component\Security\Core\Role\Role":1:{s:47:"Symfony\Component\Security\Core\Role\Rolerole";s:9:"ROLE_USER";}}i:3;a:0:{}i:4;a:2:{i:0;s:10:"ROLE_ADMIN";i:1;s:9:"ROLE_USER";}}}";}_sf2_meta|a:3:{s:1:"u";i:1627579277;s:1:"c";i:1627579277;s:1:"l";s:7:"1209600";}';
        
        $viewer->getEmail()->willReturn('user@email.com');
        $viewer->getUsername()->willReturn('username');
        $viewer->getId()->willReturn('1234');
        $viewer->isAdmin()->willReturn(true);
        $viewer->isSuperAdmin()->willReturn(true);
        $viewer->isProjectAdmin()->willReturn(true);

        $encoded = $this->encode($sessionData, $viewer);
        $this->decode($encoded)->shouldBe($sessionData);
    }
}
