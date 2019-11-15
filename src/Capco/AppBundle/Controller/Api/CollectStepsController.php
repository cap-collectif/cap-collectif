<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProposalRepository;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class CollectStepsController extends AbstractFOSRestController
{
    /**
     * @Get("/collect_step/{collectStepId}/markers")
     * @View(statusCode=200, serializerGroups={"Proposals", "UsersInfos", "UserMedias"})
     */
    public function getProposalsMarkerByCollectStepAction(string $collectStepId)
    {
        $step = $this->get(GlobalIdResolver::class)->resolve($collectStepId, $this->getUser());

        if ($step->isPrivate()) {
            throw new AccessDeniedException();
        }

        $proposalRepository = $this->get(ProposalRepository::class);
        $results = $proposalRepository->getProposalMarkersForCollectStep($step);
        $router = $this->get('router');

        return array_map(function ($proposal) use ($step, $router) {
            $location =
                \is_array($proposal['address']) ?:
                \GuzzleHttp\json_decode(stripslashes($proposal['address']), true);

            return [
                'id' => $proposal['id'],
                'title' => $proposal['title'],
                'url' => $router->generate(
                    'app_project_show_proposal',
                    [
                        'proposalSlug' => $proposal['slug'],
                        'projectSlug' => $step->getProject()->getSlug(),
                        'stepSlug' => $step->getSlug()
                    ],
                    true
                ),
                'lat' => $location[0]['geometry']['location']['lat'],
                'lng' => $location[0]['geometry']['location']['lng'],
                'address' => $location[0]['formatted_address'],
                'author' => [
                    'username' => $proposal['author']['username'],
                    'url' => $router->generate(
                        'capco_user_profile_show_all',
                        ['slug' => $proposal['author']['slug']],
                        true
                    )
                ]
            ];
        }, $results);
    }
}
