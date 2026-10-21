<?php

namespace Capco\Tests\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalAccessResolver;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public access rules with real domain entities and explicit expected permissions.
 * @covers \Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalAccessResolver
 */
class ProposalAccessResolverTest extends TestCase
{
    /** @dataProvider provideAuthorRestrictions */
    public function testAuthorRestrictions(string $identity, bool $draft, bool $preventEdit, bool $preventDelete, bool $expectedEdit, bool $expectedDelete): void
    {
        $author = new User();
        $participant = new Participant();
        $proposal = $this->proposalWithRestrictions($draft, $preventEdit, $preventDelete);
        $proposal->setAuthor($author);
        $proposal->setParticipant($participant);
        $proposal->setEmailToken('email-token');
        $helper = $this->createStub(ParticipantHelper::class);
        $helper->method('getParticipantByToken')->willReturn($participant);
        $args = match ($identity) {
            'participant' => ['participantToken' => 'participant-token'],
            'email' => ['emailToken' => 'email-token'],
            default => [],
        };

        $access = (new ProposalAccessResolver($helper))($proposal, new Argument($args), 'user' === $identity ? $author : null);

        self::assertSame(['canEdit' => $expectedEdit, 'canDelete' => $expectedDelete], $access);
    }

    /** @return iterable<string, array{string, bool, bool, bool, bool, bool}> */
    public function provideAuthorRestrictions(): iterable
    {
        $cases = [
            'published without restrictions' => [false, false, false, true, true],
            'published with edit restriction' => [false, true, false, false, true],
            'published with delete restriction' => [false, false, true, true, false],
            'published with both restrictions' => [false, true, true, false, false],
            'draft without restrictions' => [true, false, false, true, true],
            'draft with edit restriction' => [true, true, false, true, true],
            'draft with delete restriction' => [true, false, true, true, true],
            'draft with both restrictions' => [true, true, true, true, true],
        ];
        foreach (['user', 'participant', 'email'] as $identity) {
            foreach ($cases as $name => $case) {
                yield $identity . ' ' . $name => [$identity, $case[0], $case[1], $case[2], $case[3], $case[4]];
            }
        }
    }

    /** @dataProvider provideUnauthorizedIdentities */
    public function testUnauthorizedIdentityHasNoWriteAccess(string $identity): void
    {
        $proposal = $this->proposalWithRestrictions(true, false, false);
        $proposal->setAuthor(new User());
        $proposal->setParticipant(new Participant());
        $proposal->setEmailToken('email-token');
        $helper = $this->createStub(ParticipantHelper::class);
        if ('invalid-participant' === $identity) {
            $helper->method('getParticipantByToken')->willThrowException(new ParticipantNotFoundException());
        } else {
            $helper->method('getParticipantByToken')->willReturn(new Participant());
        }
        $args = match ($identity) {
            'invalid-participant', 'other-participant' => ['participantToken' => 'wrong-token'],
            'invalid-email' => ['emailToken' => 'wrong-token'],
            default => [],
        };
        $viewer = 'other-user' === $identity ? new User() : null;

        self::assertSame(['canEdit' => false, 'canDelete' => false], (new ProposalAccessResolver($helper))($proposal, new Argument($args), $viewer));
    }

    /** @return iterable<string, array{string}> */
    public function provideUnauthorizedIdentities(): iterable
    {
        foreach (['anonymous', 'other-user', 'invalid-participant', 'other-participant', 'invalid-email'] as $identity) {
            yield $identity => [$identity];
        }
    }

    /** @dataProvider provideAdministrativeAccess */
    public function testAdministrativeAccess(string $role, bool $expectedEdit, bool $expectedDelete): void
    {
        $viewer = new User();
        if ('super-admin' === $role) {
            $viewer->addRole('ROLE_SUPER_ADMIN');
        } elseif (str_starts_with($role, 'admin')) {
            $viewer->addRole('ROLE_ADMIN');
        }
        $proposal = $this->proposalWithRestrictions(false, true, true);
        $proposal->setAuthor('admin-author' === $role ? $viewer : new User());
        if ('organization-owner' === $role) {
            $organization = new Organization();
            (new OrganizationMember())->setOrganization($organization)->setUser($viewer);
            $form = new ProposalForm();
            $form->setOwner($organization);
            $proposal->setProposalForm($form);
        }
        $helper = $this->createStub(ParticipantHelper::class);

        self::assertSame(['canEdit' => $expectedEdit, 'canDelete' => $expectedDelete], (new ProposalAccessResolver($helper))($proposal, new Argument([]), $viewer));
    }

    /** @return iterable<string, array{string, bool, bool}> */
    public function provideAdministrativeAccess(): iterable
    {
        yield 'super-admin' => ['super-admin', true, true];
        yield 'admin editing another author' => ['admin', true, false];
        yield 'admin editing own proposal' => ['admin-author', false, false];
        yield 'organization owner' => ['organization-owner', true, false];
    }

    private function proposalWithRestrictions(bool $draft, bool $preventEdit, bool $preventDelete): Proposal
    {
        $step = new CollectStep();
        $step->setPreventProposalEdit($preventEdit);
        $step->setPreventProposalDelete($preventDelete);
        $proposal = new Proposal();
        $proposal->setProposalForm((new ProposalForm())->setStep($step));
        $proposal->setDraft($draft);

        return $proposal;
    }
}
