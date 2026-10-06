<?php

namespace Capco\Tests\GraphQL\Resolver\EventParticipant;

use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class IsViewerParticipatingAtEventResolverTest extends IdentityWebTestCase
{
    /** @dataProvider registrationStates */
    public function testOnlyTheRegisteredViewerIsParticipating(bool $registered): void
    {
        $viewer = $this->account();
        $other = $this->account();
        $event = $this->em->getRepository(\Capco\AppBundle\Entity\Event::class)->findOneBy([]);
        self::assertNotNull($event);
        $registration = (new \Capco\AppBundle\Entity\EventRegistration())->setEvent($event)->setUser($registered ? $viewer : $other);
        $this->em->persist($registration);
        $this->em->flush();
        $id = GlobalId::toGlobalId('Event', $event->getId());
        $this->login($viewer->getEmail());
        $result = $this->graphql('query($id: ID!) { node(id: $id) { ... on Event { isViewerParticipatingAtEvent } } }', ['id' => $id]);
        self::assertSame($registered, $result['node']['isViewerParticipatingAtEvent']);
    }

    /** @return iterable<string, array{bool}> */
    public static function registrationStates(): iterable
    {
        yield 'registered viewer' => [true];
        yield 'only another account is registered' => [false];
    }
}
