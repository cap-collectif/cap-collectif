<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Type;


use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\GraphQL\Resolver\Type\FormattedValueResponseTypeResolver;
use PhpSpec\ObjectBehavior;

class FormattedValueResponseTypeResolverSpec extends ObjectBehavior
{

    public function it_is_initializable(): void {
        $this->shouldHaveType(FormattedValueResponseTypeResolver::class);
    }

    public function it_should_correctly_return_a_comma_separated_string_when_value_is_a_json_with_other_answer_not_specified(ValueResponse $response): void
    {
        $value = <<<EOF
{"labels":["Incohérente","Que de la publicité (mensongère en plus !)"],"other":null}
EOF;

        $response->getValue()->willReturn(\GuzzleHttp\json_decode($value, true));
        $this($response)->shouldReturn("Incohérente, Que de la publicité (mensongère en plus !)");
    }

    public function it_should_correctly_return_a_comma_separated_string_when_value_is_a_json_with_other_answer_is_specified(ValueResponse $response): void
    {
        $value = <<<EOF
{"labels":["Incohérente","Que de la publicité (mensongère en plus !)"],"other":"L'autre réponse"}
EOF;

        $response->getValue()->willReturn(\GuzzleHttp\json_decode($value, true));
        $this($response)->shouldReturn("Incohérente, Que de la publicité (mensongère en plus !), L'autre réponse");
    }

    public function it_should_correcty_return_a_value_stripped_off_html_tags_when_it_has_html_tags(ValueResponse $response): void
    {
        $value = <<<EOF
{"labels":["<p>Incohérente</p>","<h1>Que de la <span class='ad'>publicité</span> (<em>mensongère</em> en plus !</h1>)"],"other":null}
EOF;
        $response->getValue()->willReturn(\GuzzleHttp\json_decode($value, true));
        $this($response)->shouldReturn("Incohérente, Que de la publicité (mensongère en plus !)");
    }

    public function it_should_correctly_return_a_string_when_value_is_a_json_with_only_one_answer_specified(ValueResponse $response): void
    {
        $value = <<<EOF
{"labels":["Incohérente"],"other": null}
EOF;

        $response->getValue()->willReturn(\GuzzleHttp\json_decode($value, true));
        $this($response)->shouldReturn("Incohérente");
    }

    public function it_should_correctly_return_a_string_when_value_is_a_json_with_only_other_answer_specified(ValueResponse $response): void
    {
        $value = <<<EOF
{"labels":null,"other": "L'autre c'est moi"}
EOF;

        $response->getValue()->willReturn(\GuzzleHttp\json_decode($value, true));
        $this($response)->shouldReturn("L'autre c'est moi");

        $value = <<<EOF
{"labels":[],"other": "L'autre c'est moi"}
EOF;

        $response->getValue()->willReturn(\GuzzleHttp\json_decode($value, true));
        $this($response)->shouldReturn("L'autre c'est moi");
    }

}
