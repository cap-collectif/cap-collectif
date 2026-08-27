<?php

namespace Capco\Tests\Controller\Site;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * @internal
 * @coversNothing
 */
class ExportControllerTest extends WebTestCase
{
    /**
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function testUserCannotExportAnotherProjectsParticipants(): void
    {
        $client = self::createClient();
        $user = self::getContainer()
            ->get(EntityManagerInterface::class)
            ->getRepository(User::class)
            ->findOneBy(['email' => 'user@test.com'])
        ;

        self::assertInstanceOf(User::class, $user);
        $client->loginUser($user);
        $client->catchExceptions(false);

        self::expectException(AccessDeniedException::class);
        $client->request('GET', '/export-step-contributors/selectionStepIdfVote?fromEmail=true');
    }
}
