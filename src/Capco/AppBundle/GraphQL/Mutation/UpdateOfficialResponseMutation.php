<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\OfficialResponse;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ErrorCode\UpdateOfficialResponseErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateOfficialResponseMutation implements MutationInterface
{
    private GlobalIdResolver $resolver;
    private EntityManagerInterface $em;

    public function __construct(GlobalIdResolver $resolver, EntityManagerInterface $em)
    {
        $this->resolver = $resolver;
        $this->em = $em;
    }

    public function __invoke(Argument $input, User $user): array
    {
        try {
            $officialResponse = $this->getOfficialResponse($input, $user);
            $this->updateOfficialResponse($officialResponse, $input, $user);
            $this->em->flush();
        } catch (UserError $exception) {
            return ['error' => $exception->getMessage()];
        }

        return compact('officialResponse');
    }

    private function updateOfficialResponse(
        OfficialResponse $officialResponse,
        Argument $input,
        User $user
    ): OfficialResponse {
        $officialResponse->setBody($input->offsetGet('body'));
        $this->updateOfficialResponsePublication($officialResponse, $input);
        $this->updateOfficialResponseAuthors(
            $officialResponse,
            $input->offsetGet('authors'),
            $user
        );
        $this->updateOfficialResponseProposal(
            $officialResponse,
            $input->offsetGet('proposal'),
            $user
        );

        return $officialResponse;
    }

    private function updateOfficialResponsePublication(
        OfficialResponse $officialResponse,
        Argument $input
    ): OfficialResponse {
        $officialResponse->setIsPublished($input->offsetGet('isPublished'));

        if (!$officialResponse->isPublished() && $input->offsetGet('publishedAt')) {
            $publishedAt = $input->offsetGet('publishedAt');
            if (!($publishedAt instanceof \DateTime)) {
                try {
                    $publishedAt = new \DateTime($publishedAt);
                } catch (\Exception $exception) {
                    throw new UserError(UpdateOfficialResponseErrorCode::INVALID_DATE);
                }
            }
            $officialResponse->setPublishedAt($publishedAt);
        }

        return $officialResponse;
    }

    private function updateOfficialResponseAuthors(
        OfficialResponse $officialResponse,
        array $authorsIds,
        User $user
    ): OfficialResponse {
        if (empty($authorsIds)) {
            throw new UserError(UpdateOfficialResponseErrorCode::NO_AUTHOR);
        }

        $officialResponse->getAuthors()->clear();
        foreach ($authorsIds as $authorsId) {
            $author = $this->resolver->resolve($authorsId, $user);
            if (null === $author) {
                throw new UserError(UpdateOfficialResponseErrorCode::AUTHOR_NOT_FOUND);
            }

            $officialResponse->addAuthor($author);
        }

        return $officialResponse;
    }

    private function updateOfficialResponseProposal(
        OfficialResponse $officialResponse,
        string $proposalId,
        User $user
    ): OfficialResponse {
        $proposal = $this->resolver->resolve($proposalId, $user);
        if (null === $proposal) {
            throw new UserError(UpdateOfficialResponseErrorCode::PROPOSAL_NOT_FOUND);
        }
        if (!$proposal->viewerIsAdminOrOwner($user)) {
            throw new UserError(UpdateOfficialResponseErrorCode::NOT_ADMIN);
        }
        if (
            $proposal->getOfficialResponse() &&
            $proposal->getOfficialResponse() !== $officialResponse
        ) {
            throw new UserError(UpdateOfficialResponseErrorCode::PROPOSAL_HAS_RESPONSE);
        }
        $officialResponse->setProposal($proposal);
        $proposal->setOfficialResponse($officialResponse);

        return $officialResponse;
    }

    private function getOfficialResponse(Argument $input, User $user): OfficialResponse
    {
        if ($input->offsetExists('id')) {
            $officialResponse = $this->resolver->resolve($input->offsetGet('id'), $user);
            if (null === $officialResponse) {
                throw new UserError(UpdateOfficialResponseErrorCode::ID_NOT_FOUND);
            }
        } else {
            $officialResponse = new OfficialResponse();
            $this->em->persist($officialResponse);
        }

        return $officialResponse;
    }
}
