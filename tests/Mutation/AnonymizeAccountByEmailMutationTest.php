<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Anonymizer\UserAnonymizer;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalAuthorDataLoader;
use Capco\AppBundle\GraphQL\Mutation\AnonymizeAccountByEmailMutation;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Mailer\SendInBlue\SendInBluePublisher;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Repository\HighlightedContentRepository;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\MediaResponseRepository;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\AppBundle\Repository\ProposalEvaluationRepository;
use Capco\AppBundle\Repository\ReportingRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 * @coversNothing
 */
class AnonymizeAccountByEmailMutationTest extends TestCase
{
    public function testItSchedulesSendInBlueContactRemovalWithTheCorrectEmail(): void
    {
        $email = 'user@test.com';
        $user = new User();
        $user->setEmail($email);

        $entityManager = $this->createStub(EntityManagerInterface::class);
        $userRepository = $this->createStub(UserRepository::class);
        $userAnonymizer = $this->createStub(UserAnonymizer::class);
        $sendInBluePublisher = $this->createMock(SendInBluePublisher::class);

        $userRepository
            ->method('findOneByEmail')
            ->willReturn($user)
        ;
        $sendInBluePublisher
            ->expects($this->once())
            ->method('pushToSendinblue')
            ->with('deleteUserFromSendInBlue', ['email' => $email])
        ;

        $mutation = new AnonymizeAccountByEmailMutation(
            $entityManager,
            $this->createStub(TranslatorInterface::class),
            $userRepository,
            $this->createStub(UserGroupRepository::class),
            $this->createStub(UserManager::class),
            $this->createStub(RedisStorageHelper::class),
            $this->createStub(MediaProvider::class),
            $this->createStub(ProposalAuthorDataLoader::class),
            $this->createStub(LoggerInterface::class),
            $this->createStub(CommentRepository::class),
            $this->createStub(ProposalEvaluationRepository::class),
            $this->createStub(AbstractResponseRepository::class),
            $this->createStub(NewsletterSubscriptionRepository::class),
            $this->createStub(MediaRepository::class),
            $this->createStub(MediaResponseRepository::class),
            $this->createStub(ValueResponseRepository::class),
            $this->createStub(ReportingRepository::class),
            $this->createStub(EventRepository::class),
            $this->createStub(HighlightedContentRepository::class),
            $this->createStub(MailingListRepository::class),
            $userAnonymizer,
            $sendInBluePublisher
        );

        $mutation(
            new Argument(['input' => ['email' => $email]]),
            new User()
        );
    }
}
