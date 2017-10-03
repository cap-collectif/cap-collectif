<?php
/**
 * Created by PhpStorm.
 * User: jeff
 * Date: 03/10/2017
 * Time: 11:30.
 */

namespace Capco\AppBundle\Search;

use Elastica\Index;
use Elastica\Query;
use Elastica\Result;
use FOS\ElasticaBundle\Transformer\ElasticaToModelTransformerInterface;

class ProposalSearch extends Search
{
    public function __construct(Index $index, ElasticaToModelTransformerInterface $transformer, $validator)
    {
        parent::__construct($index, $transformer, $validator);

        $this->type = 'proposal';
    }

    public function searchProposalsIn(array $selectedIds, string $selectedStepId = null): array
    {
        $query = new Query\BoolQuery();

        $query = $this->searchTermsInField($query, 'id', $selectedIds);

        if (null !== $selectedStepId) {
            $query = $this->searchTermsInField($query, 'selections.step.id', $selectedStepId);
        }

        $results = $this->getResults($query, count($selectedIds), false);

        return [
            'proposals' => array_map(function (Result $result) {
                return $result->getSource();
            }, $results['results']),
            'count' => $results['count'],
        ];
    }
}
