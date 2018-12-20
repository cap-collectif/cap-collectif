<?php
namespace Capco\AppBundle\Controller\Api;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;

class SelectionStepsController extends FOSRestController
{
    /**
     * @Get("/selection_step/{selectionStepId}/markers")
     * @ParamConverter("step", options={"mapping": {"selectionStepId": "id"}})
     * @View(statusCode=200, serializerGroups={"Proposals", "UsersInfos", "UserMedias"})
     */
    public function getProposalsMarkerByCollectStepAction(SelectionStep $step)
    {
        $proposalRepository = $this->get('capco.proposal.repository');
        $results = $proposalRepository->getProposalMarkersForSelectionStep($step);
        $router = $this->get('router');
        return array_map(function ($proposal) use ($step, $router) {
            $location =
                \is_array($proposal['address']) ?:
                \GuzzleHttp\json_decode($proposal['address'], true);
            return [
                'id' => $proposal['id'],
                'title' => $proposal['title'],
                'url' => $router->generate(
                    'app_project_show_proposal',
                    [
                        'proposalSlug' => $proposal['slug'],
                        'projectSlug' => $step->getProject()->getSlug(),
                        'stepSlug' => $step
                            ->getProject()
                            ->getFirstCollectStep()
                            ->getSlug(),
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
                    ),
                ],
            ];
        }, $results);
    }
}
