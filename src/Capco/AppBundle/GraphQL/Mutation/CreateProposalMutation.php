<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\ProposalType;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Error\UserErrors;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactoryInterface;

class CreateProposalMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(protected LoggerInterface $logger, protected GlobalIdResolver $globalIdResolver, protected EntityManagerInterface $em, protected FormFactoryInterface $formFactory, protected ProposalFormRepository $proposalFormRepository, protected RedisStorageHelper $redisStorageHelper, protected ProposalFormProposalsDataLoader $proposalFormProposalsDataLoader, protected Indexer $indexer, protected Manager $toggleManager, protected ResponsesFormatter $responsesFormatter, protected ProposalRepository $proposalRepository, protected Publisher $publisher)
    {
    }

    public function __invoke(Argument $input, $user): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();
        $proposalForm = $this->getProposalForm($values, $user);
        unset($values['proposalFormId']); // This only useful to retrieve the proposalForm
        $draft = false;
        if (isset($values['draft'])) {
            $draft = $values['draft'];
            unset($values['draft']);
        }

        if (
            \count(
                $this->proposalRepository->findCreatedSinceIntervalByAuthor($user, 'PT1M', 'author')
            ) >= 2
        ) {
            $this->logger->error('You contributed too many times.');
            $error = ['message' => 'You contributed too many times.'];

            return ['argument' => null, 'argumentEdge' => null, 'userErrors' => [$error]];
        }

        $proposal = $this->createAndIndexProposal(
            $values,
            $proposalForm,
            $user,
            $user,
            $draft,
            ProposalType::class
        );

        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::PROPOSAL_CREATE,
            new Message(json_encode(['proposalId' => $proposal->getId()]))
        );

        return ['proposal' => $proposal];
    }

    protected function getProposalForm(array $values, User $user): ProposalForm
    {
        /** @var ProposalForm $proposalForm */
        $proposalForm = $this->proposalFormRepository->find($values['proposalFormId']);
        if (!$proposalForm) {
            $error = sprintf('Unknown proposalForm with id "%s"', $values['proposalFormId']);
            $this->logger->error($error);

            throw new UserError($error);
        }
        if (!$proposalForm->canContribute($user) && !$user->isAdmin()) {
            throw new UserError('You can no longer contribute to this collect step.');
        }

        return $proposalForm;
    }

    protected function createAndIndexProposal(
        array $values,
        ProposalForm $proposalForm,
        User $user,
        User $author,
        bool $draft,
        string $formType
    ): Proposal {
        $values = $this->fixValues($values, $proposalForm);
        $proposal = new Proposal();
        $follower = new Follower();
        $follower->setUser($user);
        $follower->setProposal($proposal);
        $follower->setNotifiedOf(FollowerNotifiedOfInterface::ALL);

        $proposal
            ->setDraft($draft)
            ->setAuthor($author)
            ->setProposalForm($proposalForm)
            ->addFollower($follower)
        ;

        if (isset($values['publishedAt'])) {
            $publishedAt =
                $values['publishedAt'] instanceof \DateTime
                    ? $values['publishedAt']
                    : new \DateTime($values['publishedAt']);
            unset($values['publishedAt']);
            $proposal->setPublishedAt($publishedAt);
        }

        if (
            $proposalForm->getStep()
            && ($defaultStatus = $proposalForm->getStep()->getDefaultStatus())
        ) {
            $proposal->setStatus($defaultStatus);
        }
        $values = ProposalMutation::hydrateSocialNetworks($values, $proposal, $proposalForm, true);
        $form = $this->formFactory->create($formType, $proposal, [
            'proposalForm' => $proposalForm,
            'validation_groups' => [$draft ? 'ProposalDraft' : 'Default'],
        ]);

        $this->logger->info(__METHOD__ . json_encode($values, true));
        $form->submit($values);

        if (!$form->isValid()) {
            $this->handleErrors($form);
        }
        $this->em->persist($follower);
        $this->em->persist($proposal);
        $this->em->flush();
        $this->redisStorageHelper->recomputeUserCounters($user);

        // Synchronously index
        $this->indexer->index(ClassUtils::getClass($proposal), $proposal->getId());
        $this->indexer->finishBulk();
        $this->proposalFormProposalsDataLoader->invalidate($proposalForm);

        return $proposal;
    }

    protected function fixValues(array $values, ProposalForm $proposalForm): array
    {
        if (
            isset($values['theme'])
            && (!$this->toggleManager->isActive('themes') || !$proposalForm->isUsingThemes())
        ) {
            unset($values['theme']);
        }

        if (isset($values['category']) && !$proposalForm->isUsingCategories()) {
            unset($values['category']);
        }

        if (
            isset($values['districts'])
            && (!$this->toggleManager->isActive('districts') || !$proposalForm->isUsingDistrict())
        ) {
            unset($values['district']);
        }

        if (isset($values['address']) && !$proposalForm->getUsingAddress()) {
            unset($values['address']);
        }

        if (isset($values['responses'])) {
            $values['responses'] = $this->responsesFormatter->format($values['responses']);
        }

        return $values;
    }

    protected function handleErrors(Form $form): void
    {
        $errors = [];
        foreach ($form->getErrors(true) as $error) {
            $this->logger->error(__METHOD__ . ' : ' . $error->getMessage());
            $this->logger->error(
                __METHOD__ .
                    ' : ' .
                    $form->getName() .
                    ' ' .
                    'Extra data: ' .
                    implode('', $form->getExtraData())
            );
            $errors[] = (string) $error->getMessage();
        }
        if (!empty($errors)) {
            throw new UserErrors($errors);
        }
    }
}
