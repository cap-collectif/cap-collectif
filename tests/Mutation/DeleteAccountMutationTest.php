<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class DeleteAccountMutationTest extends IdentityWebTestCase
{
    public function testAccountAnonymizationKeepsAssociatedContent(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $email = $user->getEmail();
        $neighbor = $this->account();
        $neighborId = $neighbor->getId();
        $neighborEmail = $neighbor->getEmail();
        $proposal = (new Proposal())->setProposalForm($this->em->getRepository(\Capco\AppBundle\Entity\ProposalForm::class)->findOneBy([]))->setAuthor($user)->setTitle('Associated content')->setBody('Retained body');
        $this->em->persist($proposal);
        $this->em->flush();
        $proposalId = $proposal->getId();
        $this->login($email);
        $result = $this->graphql('mutation($input: DeleteAccountInput!) { deleteAccount(input: $input) { userId errorCode } }', ['input' => ['type' => 'SOFT']])['deleteAccount'];
        self::assertNull($result['errorCode']);
        self::assertSame(GlobalId::toGlobalId('User', $id), $result['userId']);
        $persisted = $this->reload($id);
        self::assertNotSame($email, $persisted->getEmail());
        self::assertNotNull($persisted->getDeletedAccountAt());
        $proposal = $this->em->find(Proposal::class, $proposalId);
        self::assertSame('Associated content', $proposal->getTitle());
        self::assertSame('Retained body', $proposal->getBody());
        self::assertSame($id, $proposal->getAuthor()->getId());
        $neighbor = $this->reload($neighborId);
        self::assertSame($neighborEmail, $neighbor->getEmail());
        self::assertNull($neighbor->getDeletedAccountAt());
        $this->assertViewer(false);
    }

    /** @dataProvider refusedDeletions */
    public function testRefusedDeletionPreservesTheProtectedAccount(bool $missing, string $type): void
    {
        $admin = $this->account()->addRole('ROLE_ADMIN');
        $target = $this->account()->addRole('ROLE_SUPER_ADMIN');
        $id = $target->getId();
        $email = $target->getEmail();
        $this->em->flush();
        $this->login($admin->getEmail());
        $query = 'mutation($input: DeleteAccountInput!) { deleteAccount(input: $input) { userId errorCode } }';
        $input = ['type' => $type, 'userId' => GlobalId::toGlobalId('User', $missing ? 'missing' : $id)];
        if ($missing) {
            $result = $this->graphResponse($query, ['input' => $input]);
            self::assertSame('Can not find this userId !', $result['errors'][0]['message']);
        } else {
            $result = $this->graphql($query, ['input' => $input])['deleteAccount'];
            self::assertSame('CANNOT_DELETE_SUPER_ADMIN', $result['errorCode']);
            self::assertSame(GlobalId::toGlobalId('User', $id), $result['userId']);
        }
        $persisted = $this->reload($id);
        self::assertSame($email, $persisted->getEmail());
        self::assertNull($persisted->getDeletedAccountAt());
    }

    /** @return iterable<string, array{bool, string}> */
    public static function refusedDeletions(): iterable
    {
        yield 'super administrator is protected from anonymization' => [false, 'SOFT'];
        yield 'super administrator is protected from content erasure' => [false, 'HARD'];
        yield 'missing account for anonymization' => [true, 'SOFT'];
        yield 'missing account for content erasure' => [true, 'HARD'];
    }

    /** @dataProvider anonymizationTypes */
    public function testSuperAdminCanAnonymizeAnotherSuperAdminAccount(string $type): void
    {
        $viewer = $this->account()->addRole('ROLE_SUPER_ADMIN');
        $viewerId = $viewer->getId();
        $viewerEmail = $viewer->getEmail();
        $target = $this->account()->addRole('ROLE_SUPER_ADMIN');
        $targetId = $target->getId();
        $targetEmail = $target->getEmail();
        $openForm = $this->em->find(\Capco\AppBundle\Entity\ProposalForm::class, 'proposalForm1');
        self::assertNotNull($openForm);
        $openForm->getStep()->setTimeless(true)->setIsEnabled(true);
        $retainedForm = (new \Capco\AppBundle\Entity\ProposalForm())->setTitle('Retained contribution structure');
        $this->em->persist($retainedForm);
        $removable = (new Proposal())->setProposalForm($openForm)->setAuthor($target)->setTitle('Removable content')->setBody('Removable body');
        $retained = (new Proposal())->setProposalForm($retainedForm)->setAuthor($target)->setTitle('Retained structure')->setBody('Retained personal content');
        $neighbor = (new Proposal())->setProposalForm($openForm)->setAuthor($viewer)->setTitle('Another authors content')->setBody('Unchanged neighboring body');
        foreach ([$removable, $retained, $neighbor] as $proposal) {
            $this->em->persist($proposal);
        }
        $this->em->flush();
        $removableId = $removable->getId();
        $retainedId = $retained->getId();
        $neighborId = $neighbor->getId();
        $this->login($viewerEmail);

        $result = $this->graphql('mutation($input: DeleteAccountInput!) { deleteAccount(input: $input) { userId errorCode } }', ['input' => ['type' => $type, 'userId' => GlobalId::toGlobalId('User', $targetId)]])['deleteAccount'];

        self::assertNull($result['errorCode']);
        self::assertSame(GlobalId::toGlobalId('User', $targetId), $result['userId']);
        $target = $this->reload($targetId);
        self::assertNotSame($targetEmail, $target->getEmail());
        self::assertNotNull($target->getDeletedAccountAt());
        $viewer = $this->reload($viewerId);
        self::assertSame($viewerEmail, $viewer->getEmail());
        self::assertNull($viewer->getDeletedAccountAt());
        $removable = $this->em->find(Proposal::class, $removableId);
        $retained = $this->em->find(Proposal::class, $retainedId);
        self::assertNotNull($retained);
        self::assertSame($targetId, $retained->getAuthor()->getId());
        if ('HARD' === $type) {
            self::assertNull($removable?->getId(), 'Removable content must no longer exist in SQL.');
            self::assertSame('deleted-title', $retained->getTitle());
            self::assertSame('deleted-content-by-author', $retained->getBody());
        } else {
            self::assertNotNull($removable);
            self::assertSame('Removable content', $removable->getTitle());
            self::assertSame('Removable body', $removable->getBody());
            self::assertSame('Retained structure', $retained->getTitle());
            self::assertSame('Retained personal content', $retained->getBody());
        }
        $neighbor = $this->em->find(Proposal::class, $neighborId);
        self::assertNotNull($neighbor);
        self::assertSame('Another authors content', $neighbor->getTitle());
        self::assertSame('Unchanged neighboring body', $neighbor->getBody());
        self::assertSame($viewerId, $neighbor->getAuthor()->getId());
        $this->assertViewer(true, $viewerId);
    }

    /** @return iterable<string, array{string}> */
    public static function anonymizationTypes(): iterable
    {
        yield 'account anonymization' => ['SOFT'];
        yield 'account anonymization with content erasure' => ['HARD'];
    }
}
