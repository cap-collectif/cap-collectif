<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\ProposalEvaluation;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Infinite\FormBundle\Form\Type\PolyCollectionType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Valid;

/**
 * @deprecated This is our legacy evaluation tool.
 */
class ProposalEvaluationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('version', IntegerType::class)
            ->add('responses', PolyCollectionType::class, [
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
                'index_property' => 'position',
                'types' => [
                    ValueResponseType::class,
                    MediaResponseType::class,
                ],
                'type_name' => AbstractResponse::TYPE_FIELD_NAME,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => ProposalEvaluation::class,
            'csrf_protection' => false,
            'constraints' => new Valid(),
            'translation_domain' => false,
            'anonymousAllowed' => false,
        ]);
    }
}
