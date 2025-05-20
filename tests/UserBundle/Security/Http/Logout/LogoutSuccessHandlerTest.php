<?php

namespace Capco\Tests\UserBundle\Security\Http\Logout;

use Capco\AppBundle\Exception\UnserializableException;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Security\Http\Logout\LogoutSuccessHandler;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

/**
 * @internal
 * @coversNothing
 */
class LogoutSuccessHandlerTest extends TestCase
{
    /**
     * @covers \LogoutSuccessHandler::setOauthTokenFromSession()
     */
    public function testUnserializeMaliciousContent(): void
    {
        $this->expectExceptionMessage('Given content is not unserializable.');
        $this->expectException(UnserializableException::class);

        $maliciousContent = 'Qzo2NzoiU3ltZm9ueVxDb21wb25lbnRcU2VjdXJpdHlcQ29yZVxBdXRoZW50aWNhdGlvblxUb2tlblxBbm9ueW1vdXNUb2tlbiI6NTM2OnthOjI6e2k6MDtOO2k6MTtPOjUxOiJTeW1mb255XENvbXBvbmVudFxWYWxpZGF0b3JcQ29uc3RyYWludFZpb2xhdGlvbkxpc3QiOjE6e3M6NjM6IgBTeW1mb255XENvbXBvbmVudFxWYWxpZGF0b3JcQ29uc3RyYWludFZpb2xhdGlvbkxpc3QAdmlvbGF0aW9ucyI7Tzo1MDoiU3ltZm9ueVxDb21wb25lbnRcRmluZGVyXEl0ZXJhdG9yXFNvcnRhYmxlSXRlcmF0b3IiOjI6e3M6NjA6IgBTeW1mb255XENvbXBvbmVudFxGaW5kZXJcSXRlcmF0b3JcU29ydGFibGVJdGVyYXRvcgBpdGVyYXRvciI7Tzo1MToiU3ltZm9ueVxDb21wb25lbnRcVmFsaWRhdG9yXENvbnN0cmFpbnRWaW9sYXRpb25MaXN0IjoxOntzOjYzOiIAU3ltZm9ueVxDb21wb25lbnRcVmFsaWRhdG9yXENvbnN0cmFpbnRWaW9sYXRpb25MaXN0AHZpb2xhdGlvbnMiO2E6Mjp7aTowO3M6NzoicGhwaW5mbyI7aToxO3M6MToiMSI7fX1zOjU2OiIAU3ltZm9ueVxDb21wb25lbnRcRmluZGVyXEl0ZXJhdG9yXFNvcnRhYmxlSXRlcmF0b3IAc29ydCI7czoxNDoiY2FsbF91c2VyX2Z1bmMiO319fX0=';

        $handlers = [];
        $tokenStorage = $this->createMock(TokenStorageInterface::class);
        $router = $this->createMock(RouterInterface::class);
        $kernel = $this->createMock(KernelInterface::class);

        $logoutHandler = new LogoutSuccessHandler(
            $handlers,
            $tokenStorage,
            $router,
            $kernel
        );

        $currentToken = $this->createMock(OAuthToken::class);
        $user = $this->createMock(User::class);

        $currentToken->method('getUser')->willReturn($user);

        $logoutHandler::setOauthTokenFromSession($currentToken, $maliciousContent);
    }
}
