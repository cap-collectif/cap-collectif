<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\MatchQuery;
use Elastica\Query\Term;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class StepController extends CRUDController
{
    /**
     * Used for autocompletion of proposals in StepAdmin.
     *
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/project/{projectId}/proposals_autocomplete", name="capco_admin_proposals_autocomplete")
     * @Entity("project", options={"mapping": {"projectId": "id"}})
     */
    public function retrieveProposalsAutocompleteItemsAction(Request $request, Project $project)
    {
        $titleQuery = new MatchQuery();
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
        $boolQuery->addFilter(
            new Term(['objectType' => ['value' => Proposal::getElasticsearchTypeName()]])
        );
        $query = new Query($boolQuery);
        $query->setTrackTotalHits(true);
        $query->setSource(['id', 'title']);
        $results = $this->get(Indexer::class)->search($query);

        $items = array_map(
            fn ($result) => ['id' => $result->getData()['id'], 'label' => $result->getData()['title']],
            $results->getResults()
        );

        return new JsonResponse([
            'status' => 'OK',
            'more' => false,
            'items' => $items,
        ]);
    }
}
