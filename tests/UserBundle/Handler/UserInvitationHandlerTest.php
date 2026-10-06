<?php

namespace Capco\Tests\UserBundle\Handler;

use Capco\Tests\IdentityWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class UserInvitationHandlerTest extends IdentityWebTestCase
{
    /**
     * @dataProvider invitations
     *
     * @param list<string> $roles
     */
    public function testRegistrationAppliesOnlyEligibleInvitationRolesAndGroups(string $kind, bool $feature, array $roles, bool $confirmed): void
    {
        $email = $this->uniqueEmail();
        $group = (new \Capco\AppBundle\Entity\Group())->setTitle('Invited group')->setDescription('Registration membership');
        $this->em->persist($group);
        $this->setFeature('project_admin', $feature);
        $invitation = null;
        if ('none' !== $kind) {
            $invitation = (new \Capco\AppBundle\Entity\UserInvite())->setEmail($email)->setToken('invitation-' . bin2hex(random_bytes(8)))->setIsAdmin('admin' === $kind)->setIsProjectAdmin('project admin' === $kind)->setExpiresAt(new \DateTime('expired' === $kind ? '2000-01-01' : '2100-01-01'))->setGroups(new \Doctrine\Common\Collections\ArrayCollection([$group]));
            $this->em->persist($invitation);
        }
        $this->em->flush();
        $groupId = $group->getId();
        $result = $this->register($email);
        self::assertNull($result['errorsCode']);
        $this->em->clear();
        $user = $this->em->getRepository(\Capco\UserBundle\Entity\User::class)->findOneBy(['email' => $email]);
        self::assertNotNull($user);
        self::assertSame($confirmed, $user->isEmailConfirmed());
        self::assertSame($roles, $user->getRoles());
        $memberships = $this->em->getRepository(\Capco\AppBundle\Entity\UserGroup::class)->findBy(['user' => $user]);
        self::assertCount($confirmed ? 1 : 0, $memberships);
        if ($confirmed) {
            self::assertSame($groupId, $memberships[0]->getGroup()->getId());
            self::assertNotNull($this->em->getRepository(\Capco\AppBundle\Entity\UserInvite::class)->findOneBy(['email' => $email]));
        }
    }

    /** @return iterable<string, array{string, bool, list<string>, bool}> */
    public static function invitations(): iterable
    {
        yield 'regular' => ['regular', false, ['ROLE_USER'], true];
        yield 'administrator' => ['admin', false, ['ROLE_USER', 'ROLE_ADMIN'], true];
        yield 'project administrator enabled' => ['project admin', true, ['ROLE_USER', 'ROLE_PROJECT_ADMIN'], true];
        yield 'project administrator disabled' => ['project admin', false, ['ROLE_USER'], true];
        yield 'without invitation' => ['none', false, ['ROLE_USER'], false];
        yield 'expired invitation' => ['expired', false, ['ROLE_USER'], false];
    }
}
