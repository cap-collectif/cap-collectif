<?php

namespace Capco\Tests\GraphQL\Resolver\Requirement;

use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class RequirementViewerValueResolverTest extends IdentityWebTestCase
{
    /** @dataProvider scalarRequirementValues */
    public function testTheViewerSeesTheirOwnProfileValue(string $type, string $setter, string $fragment, ?string $value, ?string $expected): void
    {
        $viewer = $this->account();
        $viewer->{$setter}('DATE_OF_BIRTH' === $type && null !== $value ? new \DateTime($value) : $value);
        $this->em->flush();
        $requirement = $this->requirement($type);
        $this->login($viewer->getEmail());
        $result = $this->graphql('query($id: ID!) { node(id: $id) { ... on ' . $fragment . ' } }', ['id' => GlobalId::toGlobalId('Requirement', $requirement->getId())]);
        self::assertArrayHasKey('profileValue', $result['node']);
        self::assertSame($expected, $result['node']['profileValue']);
    }

    /** @return iterable<string, array{string, string, string, ?string, ?string}> */
    public static function scalarRequirementValues(): iterable
    {
        yield 'firstname' => ['FIRSTNAME', 'setFirstname', 'FirstnameRequirement { profileValue: viewerValue }', 'John', 'John'];
        yield 'missing firstname' => ['FIRSTNAME', 'setFirstname', 'FirstnameRequirement { profileValue: viewerValue }', null, null];
        yield 'lastname' => ['LASTNAME', 'setLastname', 'LastnameRequirement { profileValue: viewerValue }', 'Doe', 'Doe'];
        yield 'missing lastname' => ['LASTNAME', 'setLastname', 'LastnameRequirement { profileValue: viewerValue }', null, null];
        yield 'phone' => ['PHONE', 'setPhone', 'PhoneRequirement { profileValue: viewerValue }', '+33628353289', '+33628353289'];
        yield 'missing phone' => ['PHONE', 'setPhone', 'PhoneRequirement { profileValue: viewerValue }', null, null];
        yield 'birth date' => ['DATE_OF_BIRTH', 'setDateOfBirth', 'DateOfBirthRequirement { profileValue: viewerDateOfBirth }', '2000-01-01 00:00:00', '2000-01-01 00:00:00'];
        yield 'missing birth date' => ['DATE_OF_BIRTH', 'setDateOfBirth', 'DateOfBirthRequirement { profileValue: viewerDateOfBirth }', null, null];
    }

    /** @dataProvider checkboxValues */
    public function testCheckboxConsentBelongsToTheViewerAndRequestedRequirement(?bool $value, bool $expected): void
    {
        $viewer = $this->account();
        $other = $this->account();
        $requirement = $this->requirement('CHECKBOX');
        $otherRequirement = $this->requirement('CHECKBOX');
        $this->em->persist(new \Capco\AppBundle\Entity\UserRequirement($other, $requirement, true));
        $this->em->persist(new \Capco\AppBundle\Entity\UserRequirement($viewer, $otherRequirement, true));
        if (null !== $value) {
            $this->em->persist(new \Capco\AppBundle\Entity\UserRequirement($viewer, $requirement, $value));
        }
        $this->em->flush();
        $this->login($viewer->getEmail());
        $this->em->clear();
        $result = $this->graphql('query($id: ID!) { node(id: $id) { ... on Requirement { viewerMeetsTheRequirement } } }', ['id' => GlobalId::toGlobalId('Requirement', $requirement->getId())]);
        self::assertSame($expected, $result['node']['viewerMeetsTheRequirement']);
    }

    /** @return iterable<string, array{?bool, bool}> */
    public static function checkboxValues(): iterable
    {
        yield 'viewer accepted this requirement' => [true, true];
        yield 'viewer explicitly declined this requirement' => [false, false];
        yield 'only another user or another requirement accepted' => [null, false];
    }

    private function requirement(string $type): \Capco\AppBundle\Entity\Requirement
    {
        $step = $this->em->getRepository(\Capco\AppBundle\Entity\Steps\CollectStep::class)->findOneBy([]);
        self::assertNotNull($step);
        $requirement = (new \Capco\AppBundle\Entity\Requirement())->setStep($step)->setType($type)->setPosition(100);
        $this->em->persist($requirement);
        $this->em->flush();

        return $requirement;
    }
}
