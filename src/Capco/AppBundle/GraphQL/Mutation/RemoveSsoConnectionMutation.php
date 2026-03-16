<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Enum\AvailableSso;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Service\User\AccountConfirmationSender;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\CreatePasswordFormType;
use Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler;
use FOS\UserBundle\Model\UserManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;
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
        private readonly FranceConnectLogoutHandler $franceConnectLogoutHandler,
        private readonly RouterInterface $router,
        private readonly AccountConfirmationSender $accountConfirmationSender
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

            if (AvailableSso::FRANCE_CONNECT === $values['service']) {
                $this->accountConfirmationSender->sendIfNeeded($viewer);
            }
        }

        $request = $requests->getCurrentRequest();
        $redirectUrl = null;
        if (AvailableSso::FRANCE_CONNECT === $values['service']) {
            $viewer->setFirstname(null);
            $viewer->setLastname(null);
            $viewer->setAddress(null);
            $viewer->setAddress2(null);
            $viewer->setCity(null);
            $viewer->setZipCode(null);
            $viewer->setBirthPlace(null);
            $viewer->setDateOfBirth(null);
            $viewer->setGender(null);
            if ($request) {
                $redirectUrl = $this->router->generate(
                    'capco_profile_edit',
                    [],
                    RouterInterface::ABSOLUTE_URL
                ) . '#account';

                if ($viewer->getFranceConnectIdToken()) {
                    FranceConnectLogoutHandler::storeAfterLogoutRedirectUrl($request, $redirectUrl);
                    $redirectUrl = $this->franceConnectLogoutHandler->getLogoutUrl(
                        $viewer,
                        null,
                        $request
                    );
                }

                FranceConnectLogoutHandler::clearFranceConnectSession($request);
            }
            $viewer->setFranceConnectIdToken(null);
        }

        $this->userManager->updateUser($viewer);

        return ['viewer' => $viewer, 'redirectUrl' => $redirectUrl];
    }
}
