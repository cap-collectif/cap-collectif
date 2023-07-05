<?php

namespace Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Enum\MajorityVoteTypeEnum;
use Capco\AppBundle\Utils\Text;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Translation\TranslatorInterface;

class FormattedValueResponseTypeResolver implements ResolverInterface
{
    private TranslatorInterface $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function __invoke(ValueResponse $response): ?string
    {
        if (null === $response->getValue()) {
            return null;
        }

        if (\is_string($response->getValue())) {
            $question = $response->getQuestion();
            if (
                $question
                && AbstractQuestion::QUESTION_TYPE_MAJORITY_DECISION === $question->getType()
            ) {
                return Text::htmlToString(
                    $this->translator->trans(
                        MajorityVoteTypeEnum::toI18nKey($response->getValue()),
                        [],
                        'CapcoAppBundle'
                    )
                );
            }

            return Text::htmlToString($response->getValue());
        }

        $value = $response->getValue();
        $filtered = array_filter(
            array_merge($value['labels'] ?? [], [$value['other'] ?? []]),
            function ($label) {
                return $label;
            }
        );
        $labels = array_map(function ($label) {
            return Text::htmlToString($label);
        }, $filtered);

        return implode(', ', $labels);
    }
}
