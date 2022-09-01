<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Doctrine\DBAL\Exception\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class AddOrganizationMutation implements MutationInterface
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function __invoke(Arg $input): array
    {
        $organization = new Organization();
        $organization->setTitle($input->offsetGet('title') ?? 'Default Title');
        // TODO email should probably be a nullable field ?
        $organization->setEmail('coucou@cap-collectif.com');

        try {
            $this->em->persist($organization);
            $this->em->flush();
        } catch (DriverException $e) {
            throw new UserError($e->getMessage());
        }

        return ['organization' => $organization];
    }
}
