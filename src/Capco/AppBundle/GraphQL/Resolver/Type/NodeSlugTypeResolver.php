<?php

namespace Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Interfaces\SluggableInterface;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class NodeSlugTypeResolver implements QueryInterface
{
    public function __construct(private readonly TypeResolver $typeResolver)
    {
    }

    public function __invoke(SluggableInterface $node): Type
    {
        if ($node instanceof Organization) {
            return $this->typeResolver->resolve('InternalOrganization');
        }
        if ($node instanceof GlobalDistrict) {
            return $this->typeResolver->resolve('InternalGlobalDistrict');
        }
        if ($node instanceof ProposalDistrict) {
            return $this->typeResolver->resolve('InternalProposalDistrict');
        }
        if ($node instanceof Page) {
            return $this->typeResolver->resolve('InternalPage');
        }
        if ($node instanceof Project) {
            return $this->typeResolver->resolve('InternalProject');
        }
        $nodeClass = $node::class;
        if (str_contains($nodeClass, 'CollectStep')) {
            return $this->typeResolver->resolve('InternalCollectStep');
        }
        if (str_contains($nodeClass, 'SelectionStep')) {
            return $this->typeResolver->resolve('InternalSelectionStep');
        }
        if (str_contains($nodeClass, 'OtherStep')) {
            return $this->typeResolver->resolve('OtherStep');
        }
        if (str_contains($nodeClass, 'ConsultationStep')) {
            return $this->typeResolver->resolve('InternalConsultationStep');
        }
        if (str_contains($nodeClass, 'PresentationStep')) {
            return $this->typeResolver->resolve('PresentationStep');
        }
        if (str_contains($nodeClass, 'RankingStep')) {
            return $this->typeResolver->resolve('RankingStep');
        }
        if (str_contains($nodeClass, 'QuestionnaireStep')) {
            return $this->typeResolver->resolve('InternalQuestionnaireStep');
        }
        if (str_contains($nodeClass, 'DebateStep')) {
            return $this->typeResolver->resolve('InternalDebateStep');
        }

        throw new UserError('Could not resolve type of Node.');
    }
}
