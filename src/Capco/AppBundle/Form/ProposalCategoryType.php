<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\CategoryImage;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\MediaBundle\Entity\Media;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProposalCategoryType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('id')
            ->add('name', TextType::class)
            ->add('categoryImage', EntityType::class, ['class' => CategoryImage::class])
            ->add('newCategoryImage', EntityType::class, [
                'class' => Media::class,
                'mapped' => false
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => ProposalCategory::class
        ]);
    }
}
