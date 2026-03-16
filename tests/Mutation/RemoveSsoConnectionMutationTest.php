<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Enum\AvailableSso;
use Capco\AppBundle\GraphQL\Mutation\RemoveSsoConnectionMutation;
use Capco\AppBundle\Service\User\AccountConfirmationSender;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler;
use FOS\UserBundle\Model\UserManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

/**
 * @internal
 * @coversNothing
 */
class RemoveSsoConnectionMutationTest extends TestCase
{
    private UserManagerInterface $userManager;
    private UserPasswordEncoderInterface $passwordEncoder;
    private Publisher $publisher;
    private LoggerInterface $logger;
    private FormFactoryInterface $formFactory;
    private FranceConnectLogoutHandler $franceConnectLogoutHandler;
    private RouterInterface $router;
    private AccountConfirmationSender $accountConfirmationSender;

    private RemoveSsoConnectionMutation $mutation;

    protected function setUp(): void
    {
        $this->userManager = $this->createMock(UserManagerInterface::class);
        $this->passwordEncoder = $this->createMock(UserPasswordEncoderInterface::class);
        $this->publisher = $this->createMock(Publisher::class);
        $this->logger = $this->createMock(LoggerInterface::class);
        $this->formFactory = $this->createMock(FormFactoryInterface::class);
        $this->franceConnectLogoutHandler = $this->createMock(FranceConnectLogoutHandler::class);
        $this->router = $this->createMock(RouterInterface::class);
        $this->accountConfirmationSender = $this->createMock(AccountConfirmationSender::class);

        $this->mutation = new RemoveSsoConnectionMutation(
            $this->userManager,
            $this->passwordEncoder,
            $this->publisher,
            $this->logger,
            $this->formFactory,
            $this->franceConnectLogoutHandler,
            $this->router,
            $this->accountConfirmationSender
        );
    }

    public function testFranceConnectDissociationSchedulesLogoutAndRedirectsToProfile(): void
    {
        $viewer = new User();
        $viewer->setFranceConnectId('fc-id');
        $viewer->setFranceConnectAccessToken('fc-access-token');
        $viewer->setFranceConnectIdToken('fc-id-token');
        $viewer->setFirstname('Jane');
        $viewer->setLastname('Doe');
        $viewer->setCity('Paris');
        $viewer->setZipCode('75000');
        $viewer->setBirthPlace('Paris');
        $viewer->setGender('f');
        $viewer->setAddress('1 rue de Paris');
        $viewer->setAddress2('Bat A');
        $viewer->setDateOfBirth(new \DateTime('1990-01-01'));

        $request = new Request();
        $session = new Session(new MockArraySessionStorage());
        $session->set(FranceConnectLogoutHandler::SESSION_LOGOUT_REQUIRED_KEY, true);
        $session->set(FranceConnectLogoutHandler::SESSION_ID_TOKEN_KEY, 'fc-id-token');
        $request->setSession($session);

        $requestStack = new RequestStack();
        $requestStack->push($request);

        $argument = new Argument([
            'input' => [
                'service' => AvailableSso::FRANCE_CONNECT,
            ],
        ]);

        $profileUrl = 'https://capco.dev/profile/edit-profile';
        $redirectUrl = 'https://capco.dev/profile/edit-profile#account';
        $logoutUrl = 'https://fc.example/logout?id_token_hint=fc-id-token';

        $this->router->expects($this->once())
            ->method('generate')
            ->with('capco_profile_edit', [], RouterInterface::ABSOLUTE_URL)
            ->willReturn($profileUrl)
        ;
        $this->franceConnectLogoutHandler->expects($this->once())
            ->method('getLogoutUrl')
            ->with($viewer, null, $request)
            ->willReturn($logoutUrl)
        ;

        $this->userManager->expects($this->once())
            ->method('updateUser')
            ->with($viewer)
        ;

        $payload = $this->mutation->__invoke($argument, $viewer, $requestStack);

        $this->assertSame($logoutUrl, $payload['redirectUrl']);
        $this->assertNull($viewer->getFranceConnectId());
        $this->assertNull($viewer->getFranceConnectAccessToken());
        $this->assertNull($viewer->getFranceConnectIdToken());
        $this->assertNull($viewer->getFirstname());
        $this->assertNull($viewer->getLastname());
        $this->assertNull($viewer->getCity());
        $this->assertNull($viewer->getZipCode());
        $this->assertNull($viewer->getBirthPlace());
        $this->assertNull($viewer->getDateOfBirth());
        $this->assertNull($session->get(FranceConnectLogoutHandler::SESSION_LOGOUT_REQUIRED_KEY));
        $this->assertNull($session->get(FranceConnectLogoutHandler::SESSION_ID_TOKEN_KEY));
        $this->assertNull($session->get(FranceConnectLogoutHandler::SESSION_POST_LOGOUT_REDIRECT_URL_KEY));
        $this->assertSame($redirectUrl, $session->get(FranceConnectLogoutHandler::SESSION_AFTER_LOGOUT_REDIRECT_URL_KEY));
    }
}
