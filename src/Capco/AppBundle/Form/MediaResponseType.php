<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\MediaBundle\Entity\Media;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class MediaResponseType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
          ->add('question', EntityType::class, ['class' => MediaQuestion::class])
          ->add('medias', EntityType::class, [
              'class' => Media::class,
              'multiple' => true,
              'constraints' => [
                new Assert\Count([
                  'max' => 20,
                  'maxMessage' => 'You must add 20 files or less.',
                ]),
              ],
          ])
        ;

        $builder->add('position', HiddenType::class, [
            'mapped' => false,
        ]);

        $builder->add(AbstractResponse::TYPE_FIELD_NAME, HiddenType::class, [
            'data' => $this->getBlockPrefix(),
            'mapped' => false,
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => MediaResponse::class,
            'model_class' => MediaResponse::class,
        ]);
    }

    public function getBlockPrefix(): string
    {
        return 'media_response';
    }
}
