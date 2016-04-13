<?php

namespace spec\Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Response;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class HasResponsesToRequiredQuestionsValidatorSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Validator\Constraints\HasResponsesToRequiredQuestionsValidator');
    }

    function it_should_find_if_proposal_has_response_for_question(AbstractQuestion $question1, AbstractQuestion $question2, Response $response1, Response $response2, Response $response3)
    {
        // Response exists
        $response1->getQuestion()->willReturn($question1);
        $response1->getValue()->willReturn('coucou');

        // Response exist with empty
        $response2->getQuestion()->willReturn($question1);
        $response2->getValue()->willReturn('');

        // Response does not exist
        $response3->getQuestion()->willReturn($question2);
        $response3->getValue()->willReturn('coucou');

        $this->hasResponseForQuestion($question1, [$response1])->shouldReturn(true);
        $this->hasResponseForQuestion($question1, [$response2])->shouldReturn(false);
        $this->hasResponseForQuestion($question1, [$response3])->shouldReturn(false);
    }

}
