<?php

namespace Capco\Tests\Controller\Site\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\Tests\IdentityWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class OrganizationControllerTest extends IdentityWebTestCase
{
    /** @dataProvider invitationViewers */
    public function testInvitationChangesOnlyTheIntendedMembership(string $viewer, string $role, bool $knownToken, bool $accepted): void
    {
        $invitee = $this->account();
        $other = $this->account();
        $organization = (new Organization())->setTitle('Invited organization')->setBody('Invitation context')->setEmail($this->uniqueEmail());
        $invitation = (new PendingOrganizationInvitation())->setUser($invitee)->setOrganization($organization)->setRole($role)->setCreator($invitee)->setExpiresAt(new \DateTime('2100-01-01'))->setToken(bin2hex(random_bytes(16)));
        $otherInvitation = (new PendingOrganizationInvitation())->setUser($other)->setOrganization($organization)->setRole('admin')->setCreator($invitee)->setExpiresAt(new \DateTime('2100-01-01'))->setToken(bin2hex(random_bytes(16)));
        $this->em->persist($organization);
        $this->em->persist($invitation);
        $this->em->persist($otherInvitation);
        $this->em->flush();
        $id = $invitation->getId();
        $otherInvitationId = $otherInvitation->getId();
        $otherToken = $otherInvitation->getToken();
        $organizationId = $organization->getId();
        $inviteeId = $invitee->getId();
        $otherId = $other->getId();
        if ('anonymous' !== $viewer) {
            $this->login('invitee' === $viewer ? $invitee->getEmail() : $other->getEmail());
        }

        $this->browser->request('GET', '/invitation/organization/' . ($knownToken ? $invitation->getToken() : bin2hex(random_bytes(16))));

        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertSame($accepted ? '/admin-next/projects' : '/', $this->browser->getResponse()->headers->get('Location'));
        $this->assertViewer($accepted || 'anonymous' !== $viewer, $accepted || 'invitee' === $viewer ? $inviteeId : $otherId);
        $this->em->clear();
        $member = $this->em->getRepository(OrganizationMember::class)->findOneBy(['organization' => $organizationId, 'user' => $inviteeId]);
        if ($accepted) {
            self::assertInstanceOf(OrganizationMember::class, $member);
            self::assertSame($role, $member->getRole());
            self::assertNull($this->em->find(PendingOrganizationInvitation::class, $id)?->getId());
        } else {
            self::assertNull($member?->getId());
            self::assertNotNull($this->em->find(PendingOrganizationInvitation::class, $id));
        }
        self::assertCount($accepted ? 1 : 0, $this->em->getRepository(OrganizationMember::class)->findBy(['organization' => $organizationId]));
        $pending = $this->em->find(PendingOrganizationInvitation::class, $otherInvitationId);
        self::assertInstanceOf(PendingOrganizationInvitation::class, $pending);
        self::assertSame($otherToken, $pending->getToken());
        self::assertSame('admin', $pending->getRole());
        self::assertSame($otherId, $pending->getUser()->getId());
    }

    /** @return iterable<string, array{string, string, bool, bool}> */
    public static function invitationViewers(): iterable
    {
        yield 'connected invitee joins as member' => ['invitee', 'user', true, true];
        yield 'connected invitee joins as administrator' => ['invitee', 'admin', true, true];
        yield 'anonymous invitee is logged in as member' => ['anonymous', 'user', true, true];
        yield 'anonymous invitee is logged in as administrator' => ['anonymous', 'admin', true, true];
        yield 'other account refused' => ['other', 'admin', true, false];
        yield 'unknown token refused' => ['anonymous', 'user', false, false];
    }
}
