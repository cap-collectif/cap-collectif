<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Match;
use Elastica\Query\Term;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class StepController extends CRUDController
{
    /**
     * Used for autocompletion of proposals in StepAdmin.
     *
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/project/{projectId}/proposals_autocomplete", name="capco_admin_proposals_autocomplete")
     * @ParamConverter("project", options={"mapping": {"projectId": "id"}})
     */
    public function retrieveProposalsAutocompleteItemsAction(Request $request, Project $project)
    {
        $titleQuery = new Match();
        $titleQuery->setFieldQuery('title.autocomplete', $request->query->get('q'));
        $titleQuery->setFieldParam('title.autocomplete', 'analyzer', 'standard');

        $boolQuery = new BoolQuery();
        $boolQuery->addMust($titleQuery);
        $boolQuery->addMust(
            new Term([
                'proposalForm.id' => $project
                    ->getFirstStep()
                    ->getProposalForm()
                    ->getId(),
            ])
        );

        $query = new Query($boolQuery);
        $query->setSource(['id', 'title']);
        $results = $this->get(Indexer::class)
            ->getType(Proposal::getElasticsearchTypeName())
            ->search($query);

        $items = array_map(function ($result) {
            return ['id' => $result->getData()['id'], 'label' => $result->getData()['title']];
        }, $results->getResults());

        return new JsonResponse([
            'status' => 'OK',
            'more' => false,
            'items' => $items,
        ]);
    }
}
