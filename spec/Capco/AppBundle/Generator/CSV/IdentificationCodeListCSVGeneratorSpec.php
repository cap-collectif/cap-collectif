<?php

namespace spec\Capco\AppBundle\Generator\CSV;

use Capco\AppBundle\Entity\Security\UserIdentificationCode;
use Capco\AppBundle\Entity\Security\UserIdentificationCodeList;
use Capco\AppBundle\Generator\CSV\IdentificationCodeListCSVGenerator;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

class IdentificationCodeListCSVGeneratorSpec extends ObjectBehavior
{
    public function let()
    {
        $this->beConstructedWith();
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(IdentificationCodeListCSVGenerator::class);
    }

    public function it_should_generate_csv_response_from_list(
        UserIdentificationCodeList $list,
        UserIdentificationCode $codeA,
        UserIdentificationCode $codeB
    ) {
        $list
            ->getCodes()
            ->shouldBeCalledOnce()
            ->willReturn(
                new ArrayCollection([$codeA->getWrappedObject(), $codeB->getWrappedObject()])
            );
        $codeA
            ->toArray()
            ->willReturn([
                'm.',
                'Jean',
                'Dupuis',
                '12 rue des Marguerites',
                '',
                '',
                '42001',
                'Fleur-sur-prés',
                'France',
                'XXXXXX',
            ]);
        $codeB
            ->toArray()
            ->willReturn([
                'mme.',
                'Jeanne',
                'Dupuis',
                '12 rue des Marguerites',
                '',
                '',
                '42001',
                'Fleur-sur-prés',
                'France',
                'XXXXXY',
            ]);

        $response = $this->generateFromList($list);
        $response->shouldBeAnInstanceOf(Response::class);
        $response->headers->shouldHaveType(ResponseHeaderBag::class);
        $response->headers->get('Content-Type')->shouldBe('text/csv');
        $response
            ->getContent()
            ->shouldBe(
                'title;firstname;lastname;address1;address2;address3;zipCode;city;country;"id codes"' .
                    "\n" .
                    'm.;Jean;Dupuis;"12 rue des Marguerites";;;42001;Fleur-sur-prés;France;XXXXXX' .
                    "\n" .
                    'mme.;Jeanne;Dupuis;"12 rue des Marguerites";;;42001;Fleur-sur-prés;France;XXXXXY'
            );
    }
}
