<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\OfficialResponse;
use Capco\AppBundle\Entity\OfficialResponseAuthor;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ErrorCode\UpdateOfficialResponseErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\ProposalFormVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateOfficialResponseMutation implements MutationInterface
{
    use MutationTrait;
    private GlobalIdResolver $resolver;
    private EntityManagerInterface $em;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(GlobalIdResolver $resolver, EntityManagerInterface $em, AuthorizationCheckerInterface $authorizationChecker)
    {
        $this->resolver = $resolver;
        $this->em = $em;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $this->formatInput($input);

        try {
            $officialResponse = $this->getOfficialResponse($input, $user);
            $this->updateOfficialResponse($officialResponse, $input, $user);
            $this->em->flush();
        } catch (UserError $exception) {
            return ['error' => $exception->getMessage()];
        }

        return compact('officialResponse');
    }

    public function isGranted(string $proposalId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        /** * @var Proposal $proposal  */
        $proposal = $this->resolver->resolve($proposalId, $viewer);
        if (!$proposal) {
            return false;
        }

        $proposalForm = $proposal->getProposalForm();

        return $this->authorizationChecker->isGranted(ProposalFormVoter::EDIT, $proposalForm);
    }

    private function updateOfficialResponse(
        OfficialResponse $officialResponse,
        Argument $input,
        User $user
    ): OfficialResponse {
        $officialResponse->setBody($input->offsetGet('body'));
        $officialResponse->setBodyUsingJoditWysiwyg($input->offsetGet('bodyUsingJoditWysiwyg') ?? false);
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

        if ($user->isOrganizationMember()) {
            $organization = $this->resolver->resolve($user->getOrganizationId(), $user);
            $officialResponseAuthor = (new OfficialResponseAuthor())
                ->setAuthor($organization)
                ->setOfficialResponse($officialResponse)
            ;
            $officialResponse->addAuthor($officialResponseAuthor);

            return $officialResponse;
        }

        $officialResponse->getAuthors()->clear();
        foreach ($authorsIds as $authorsId) {
            $author = $this->resolver->resolve($authorsId, $user);
            if (null === $author) {
                throw new UserError(UpdateOfficialResponseErrorCode::AUTHOR_NOT_FOUND);
            }
            $officialResponseAuthor = (new OfficialResponseAuthor())
                ->setAuthor($author)
                ->setOfficialResponse($officialResponse)
            ;
            $officialResponse->addAuthor($officialResponseAuthor);
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
        if (
            $proposal->getOfficialResponse()
            && $proposal->getOfficialResponse() !== $officialResponse
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
