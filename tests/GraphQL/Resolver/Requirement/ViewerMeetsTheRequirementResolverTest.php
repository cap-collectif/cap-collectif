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
final class ViewerMeetsTheRequirementResolverTest extends IdentityWebTestCase
{
    /** @dataProvider profileValues */
    public function testRequirementsAreMetOnlyWithAProfileValue(string $type, string $setter, ?string $value, bool $met): void
    {
        $viewer = $this->account();
        $viewer->{$setter}('DATE_OF_BIRTH' === $type && null !== $value ? new \DateTime($value) : $value);
        $this->em->flush();
        $requirement = $this->requirement($type);
        $this->login($viewer->getEmail());
        $result = $this->graphql('query($id: ID!) { node(id: $id) { ... on Requirement { viewerMeetsTheRequirement } } }', ['id' => GlobalId::toGlobalId('Requirement', $requirement->getId())]);
        self::assertSame($met, $result['node']['viewerMeetsTheRequirement']);
    }

    /** @return iterable<string, array{string, string, ?string, bool}> */
    public static function profileValues(): iterable
    {
        yield 'filled firstname' => ['FIRSTNAME', 'setFirstname', 'John', true];
        yield 'missing firstname' => ['FIRSTNAME', 'setFirstname', null, false];
        yield 'filled birth date' => ['DATE_OF_BIRTH', 'setDateOfBirth', '2000-01-01', true];
        yield 'missing birth date' => ['DATE_OF_BIRTH', 'setDateOfBirth', null, false];
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
