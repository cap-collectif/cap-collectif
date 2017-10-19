<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Helper\GeometryHelper;
use Overblog\GraphQLBundle\Error\UserError;
use PhpParser\Node\Arg;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class QuestionResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolveType(AbstractQuestion $question): string
    {
        return $question->getType();
    }

    public function resolve(Arg $args): AbstractQuestion
    {
        return $this->container->get('capco.abstract_question.repository')->find($args['id']);
    }

    public function resolveDistrictsForLocalisation(string $proposalFormId, float $latitude, float $longitude): array
    {
        $form = $this->container->get('capco.proposal_form.repository')->find($proposalFormId);
        $districts = $form->getDistricts();

        return $form->isProposalInAZoneRequired() ? $districts->filter(function ($district) use ($longitude, $latitude) {
            return $district->getGeojson() && GeometryHelper::isIncluded($longitude, $latitude, $district->getGeojson());
        }, [])->toArray() : $districts->toArray();
    }

    public function resolvePosition(AbstractQuestion $question): int
    {
        return $question->getQuestionnaireAbstractQuestion()->getPosition();
    }

    public function resolveisOtherAllowed(AbstractQuestion $question): bool
    {
        if ($question instanceof MultipleChoiceQuestion) {
            return $question->isOtherAllowed();
        }

        return false;
    }

    public function resolveChoices(AbstractQuestion $question)
    {
        if ($question instanceof MultipleChoiceQuestion) {
            return $question->getQuestionChoices();
        }

        return null;
    }

    public function resolveValidationRule(AbstractQuestion $question)
    {
        if ($question instanceof MultipleChoiceQuestion) {
            return $question->getValidationRule();
        }

        return null;
    }

    public function resolveAvailableQuestionnaires()
    {
        return $this->container
            ->get('capco.questionnaire.repository')
            ->getAvailableQuestionnaires();
    }

    public function resolveQuestionType(AbstractQuestion $question): string
    {
        $typeResolver = $this->container->get('overblog_graphql.type_resolver');
        if ($question instanceof SimpleQuestion) {
            return $typeResolver->resolve('SimpleQuestion');
        }
        if ($question instanceof MediaQuestion) {
            return $typeResolver->resolve('MediaQuestion');
        }

        throw new UserError('Could not resolve type of Question.');
    }
}
