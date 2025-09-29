<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Enum\AvailableSso;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\CreatePasswordFormType;
use Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler;
use Capco\UserBundle\Security\Http\Logout\Handler\RedirectResponseWithRequest;
use Capco\UserBundle\Security\Http\Logout\LogoutSuccessHandler;
use FOS\UserBundle\Model\UserManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class RemoveSsoConnectionMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly UserManagerInterface $userManager,
        private readonly UserPasswordEncoderInterface $passwordEncoder,
        private readonly Publisher $publisher,
        private readonly LoggerInterface $logger,
        private readonly FormFactoryInterface $formFactory,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly FranceConnectLogoutHandler $franceConnectLogoutHandler,
        private readonly RouterInterface $router
    ) {
    }

    public function __invoke(Argument $input, User $viewer, RequestStack $requests): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();
        $service = AvailableSso::SsoList[$values['service']];
        $setter = 'set' . $service;
        $setterId = $setter . 'Id';
        $setterToken = $setter . 'AccessToken';

        $viewer->{$setterId}(null);
        $viewer->{$setterToken}(null);

        if (isset($values['plainPassword']) && !$viewer->getPassword()) {
            $form = $this->formFactory->create(CreatePasswordFormType::class, null, [
                'csrf_protection' => false,
            ]);
            $form->submit(
                [
                    'plainPassword' => $values['plainPassword'],
                ],
                false
            );
            if (!$form->isValid()) {
                $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

                return ['viewer' => $viewer, 'error' => 'fos_user.password.not_valid'];
            }

            $this->logger->debug(__METHOD__ . ' : ' . (string) $form->isValid());
            $viewer->setPlainPassword($values['plainPassword']);
            $this->publisher->publish(
                'user.password',
                new Message(
                    json_encode([
                        'userId' => $viewer->getId(),
                    ])
                )
            );
        }

        $request = $requests->getCurrentRequest();
        $response = null;
        if ($request) {
            $profileUrl = $this->router->generate(
                'capco_profile_edit',
                [],
                RouterInterface::ABSOLUTE_URL
            );
            $redirect = new RedirectResponse($profileUrl);
            $response = new RedirectResponseWithRequest($request, $redirect);
        }
        $redirectUrl = null;
        if (AvailableSso::FRANCE_CONNECT === $values['service']) {
            $currentToken = $this->tokenStorage->getToken();
            $theToken = $request->getSession()->get('theToken');
            LogoutSuccessHandler::setOauthTokenFromSession($currentToken, $theToken);

            $viewer->setFirstname(null);
            $viewer->setLastname(null);
            $viewer->setAddress(null);
            $viewer->setAddress2(null);
            $viewer->setCity(null);
            $viewer->setZipCode(null);
            $viewer->setBirthPlace(null);
            $viewer->setDateOfBirth(null);
            $viewer->setGender(null);
            if ($response) {
                $response = $this->franceConnectLogoutHandler->handle($response);
                $redirectUrl = $response->getResponse()->getTargetUrl();
            }
        }

        $this->userManager->updateUser($viewer);

        return ['viewer' => $viewer, 'redirectUrl' => $redirectUrl];
    }
}
