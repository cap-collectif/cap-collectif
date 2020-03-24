<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Infinite\FormBundle\Form\Type\PolyCollectionType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProposalAnalysisType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('responses', PolyCollectionType::class, [
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
                'index_property' => 'position',
                'types' => [ValueResponseType::class, MediaResponseType::class],
                'type_name' => AbstractResponse::TYPE_FIELD_NAME,
            ]);
    }
    
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => ProposalAnalysis::class,
            'csrf_protection' => false,
        ]);
    }
}
