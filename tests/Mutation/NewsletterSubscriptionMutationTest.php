<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Enum\NewsletterSubscriptionErrorCode;
use Capco\AppBundle\GraphQL\Mutation\NewsletterSubscription\CreateNewsletterSubscriptionMutation;
use Capco\AppBundle\GraphQL\Mutation\NewsletterSubscription\DeleteNewsletterSubscriptionMutation;
use Capco\AppBundle\GraphQL\Mutation\NewsletterSubscription\NewsletterSubscriptionEmailValidator;
use Capco\AppBundle\GraphQL\Mutation\NewsletterSubscription\UpdateNewsletterSubscriptionMutation;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;

/**
 * @internal
 * @coversNothing
 */
class NewsletterSubscriptionMutationTest extends TestCase
{
    private MockObject & EntityManagerInterface $entityManager;
    private MockObject & NewsletterSubscriptionRepository $repository;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->repository = $this->createMock(NewsletterSubscriptionRepository::class);
    }

    public function testCreateRejectsAnInvalidEmailWithoutPersisting(): void
    {
        $this->entityManager->expects(self::never())->method('persist');
        $this->entityManager->expects(self::never())->method('flush');

        self::assertSame(
            ['newsletterSubscription' => null, 'errorCode' => NewsletterSubscriptionErrorCode::INVALID_EMAIL],
            $this->createMutation()(new Argument(['input' => ['email' => 'not-an-email', 'isEnabled' => true]]))
        );
    }

    public function testCreateRejectsAnEmailAlreadyUsed(): void
    {
        $this->repository
            ->method('findOneBy')
            ->with(['email' => 'taken@example.test'])
            ->willReturn(new NewsletterSubscription())
        ;
        $this->entityManager->expects(self::never())->method('persist');

        self::assertSame(
            ['newsletterSubscription' => null, 'errorCode' => NewsletterSubscriptionErrorCode::EMAIL_ALREADY_USED],
            $this->createMutation()(new Argument(['input' => ['email' => 'taken@example.test', 'isEnabled' => true]]))
        );
    }

    public function testCreatePersistsTheTrimmedEmail(): void
    {
        $this->repository->method('findOneBy')->willReturn(null);
        $this->entityManager->expects(self::once())->method('persist');
        $this->entityManager->expects(self::once())->method('flush');

        $result = $this->createMutation()(new Argument(['input' => [
            'email' => ' new@example.test ',
            'isEnabled' => false,
        ]]));

        self::assertNull($result['errorCode']);
        self::assertInstanceOf(NewsletterSubscription::class, $result['newsletterSubscription']);
        self::assertSame('new@example.test', $result['newsletterSubscription']->getEmail());
        self::assertFalse($result['newsletterSubscription']->getIsEnabled());
    }

    public function testUpdateReturnsNotFoundWithoutFlushing(): void
    {
        $this->repository->expects(self::once())->method('find')->with('404')->willReturn(null);
        $this->entityManager->expects(self::never())->method('flush');

        self::assertSame(
            ['newsletterSubscription' => null, 'errorCode' => NewsletterSubscriptionErrorCode::NOT_FOUND],
            $this->updateMutation()(new Argument(['input' => [
                'id' => '404',
                'email' => 'a@example.test',
                'isEnabled' => true,
            ]]))
        );
    }

    public function testUpdateKeepsItsOwnEmail(): void
    {
        $subscription = (new NewsletterSubscription())->setEmail('me@example.test')->setIsEnabled(true);
        $this->repository->method('find')->with('1')->willReturn($subscription);
        $this->repository->method('findOneBy')->with(['email' => 'me@example.test'])->willReturn($subscription);
        $this->entityManager->expects(self::once())->method('flush');

        $result = $this->updateMutation()(new Argument(['input' => [
            'id' => '1',
            'email' => 'me@example.test',
            'isEnabled' => false,
        ]]));

        self::assertNull($result['errorCode']);
        self::assertFalse($subscription->getIsEnabled());
    }

    public function testUpdateRejectsTheEmailOfAnotherSubscription(): void
    {
        $subscription = (new NewsletterSubscription())->setEmail('me@example.test');
        $this->repository->method('find')->with('1')->willReturn($subscription);
        $this->repository->method('findOneBy')->willReturn((new NewsletterSubscription())->setEmail('other@example.test'));
        $this->entityManager->expects(self::never())->method('flush');

        $result = $this->updateMutation()(new Argument(['input' => [
            'id' => '1',
            'email' => 'other@example.test',
            'isEnabled' => true,
        ]]));

        self::assertSame(NewsletterSubscriptionErrorCode::EMAIL_ALREADY_USED, $result['errorCode']);
        self::assertSame('me@example.test', $subscription->getEmail());
    }

    public function testDeleteReturnsNotFoundWithoutRemoving(): void
    {
        $this->repository->method('find')->with('404')->willReturn(null);
        $this->entityManager->expects(self::never())->method('remove');

        self::assertSame(
            ['deletedNewsletterSubscriptionId' => null, 'errorCode' => NewsletterSubscriptionErrorCode::NOT_FOUND],
            $this->deleteMutation()(new Argument(['input' => ['id' => '404']]))
        );
    }

    public function testDeleteRemovesTheSubscription(): void
    {
        $subscription = new NewsletterSubscription();
        $this->repository->method('find')->with('1')->willReturn($subscription);
        $this->entityManager->expects(self::once())->method('remove')->with($subscription);
        $this->entityManager->expects(self::once())->method('flush');

        self::assertSame(
            ['deletedNewsletterSubscriptionId' => '1', 'errorCode' => null],
            $this->deleteMutation()(new Argument(['input' => ['id' => '1']]))
        );
    }

    private function emailValidator(): NewsletterSubscriptionEmailValidator
    {
        return new NewsletterSubscriptionEmailValidator(Validation::createValidator(), $this->repository);
    }

    private function createMutation(): CreateNewsletterSubscriptionMutation
    {
        return new CreateNewsletterSubscriptionMutation($this->entityManager, $this->emailValidator());
    }

    private function updateMutation(): UpdateNewsletterSubscriptionMutation
    {
        return new UpdateNewsletterSubscriptionMutation($this->entityManager, $this->repository, $this->emailValidator());
    }

    private function deleteMutation(): DeleteNewsletterSubscriptionMutation
    {
        return new DeleteNewsletterSubscriptionMutation($this->entityManager, $this->repository);
    }
}
