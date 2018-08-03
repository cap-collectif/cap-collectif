<?php
namespace Capco\AppBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Capco\AppBundle\Entity\Interfaces\TrashableInterface;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

class TrashedStatusType extends AbstractType
{
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'label' => 'admin.fields.opinion.is_trashed',
            'required' => false,
            'placeholder' => 'synthesis.source_types.none',
            'choices' => [
                'trashed-visible-content' => TrashableInterface::STATUS_VISIBLE,
                'trashed-hidden-content' => TrashableInterface::STATUS_INVISIBLE,
            ],
        ]);
    }

    public function getParent()
    {
        return ChoiceType::class;
    }
}
