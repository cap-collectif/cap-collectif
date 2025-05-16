<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\CollectStepImapServerConfig;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Form\CollectStepImapServerConfigType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Imap\Exception\AuthenticationFailedException;
use Capco\AppBundle\Imap\Exception\ConnectionToServerFailedException;
use Capco\AppBundle\Imap\Exception\FolderNotFoundException;
use Capco\AppBundle\Imap\ImapClient;
use Capco\AppBundle\Repository\CollectStepImapServerConfigRepository;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class SaveImapConfigMutation implements MutationInterface
{
    use MutationTrait;
    public const FOLDER_NOT_FOUND = 'FOLDER_NOT_FOUND';
    public const CONNECTION_TO_SERVER_FAILED = 'CONNECTION_TO_SERVER_FAILED';
    public const AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED';
    public const EMAIL_ALREADY_USED = 'EMAIL_ALREADY_USED';

    public function __construct(
        private readonly CollectStepImapServerConfigRepository $collectStepImapServerConfigRepository,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly FormFactoryInterface $formFactory,
        private readonly EntityManagerInterface $em,
        private readonly AuthorizationCheckerInterface $authorizationChecker
    ) {
    }

    /**
     * @throws \Exception
     *
     * @return array{errorCode: int|string|null, imapConfig?: object|null}
     */
    public function __invoke(string $serverUrl, string $folder, string $email, string $password, string $stepId, ?string $id): array
    {
        if (!$this->isEmailAvailable($email, $stepId)) {
            return ['errorCode' => self::EMAIL_ALREADY_USED];
        }

        $config = $id ? $this->collectStepImapServerConfigRepository->find($id) : new CollectStepImapServerConfig();

        // when editing we do not query the password in the UI, instead we replace it with ****
        // so when we test the connection in edit mode and the user did not modify their password we need to replace it with the existing password
        if ('****' === $password) {
            $password = $config->getPassword();
        }

        $client = new ImapClient($serverUrl, $email, $password);

        try {
            $client->testConnection($folder);
        } catch (FolderNotFoundException) {
            return ['errorCode' => self::FOLDER_NOT_FOUND];
        } catch (AuthenticationFailedException) {
            return ['errorCode' => self::AUTHENTICATION_FAILED];
        } catch (ConnectionToServerFailedException) {
            return ['errorCode' => self::CONNECTION_TO_SERVER_FAILED];
        }

        $form = $this->formFactory->create(CollectStepImapServerConfigType::class, $config);

        $form->submit([
            'collectStep' => $stepId,
            'email' => $email,
            'folder' => $folder,
            'password' => $password,
            'serverUrl' => $serverUrl,
        ], false);

        if (!$form->isValid()) {
            throw new UserError('form not valid');
        }

        $step = $config->getCollectStep();
        $step->setIsCollectByEmailEnabled(true);

        $this->em->persist($config);
        $this->em->flush();

        return ['errorCode' => null, 'imapConfig' => $config];
    }

    public function isGranted(string $stepId, User $user): bool
    {
        $step = $this->globalIdResolver->resolve($stepId, $user);

        if (!$step instanceof CollectStep) {
            throw new \Exception('Step must be instance of CollectStep or is not accessible for given user.');
        }

        return $this->authorizationChecker->isGranted(ProjectVoter::EDIT, $step->getProject());
    }

    private function isEmailAvailable(string $email, string $stepId): bool
    {
        $config = $this->collectStepImapServerConfigRepository->findOneBy(['email' => $email]);

        if (!$config) {
            return true;
        }

        $step = $this->globalIdResolver->resolve($stepId);

        if (!$step instanceof CollectStep) {
            throw new \Exception('Step must be instance of CollectStep');
        }

        return $step === $config->getCollectStep();
    }
}
