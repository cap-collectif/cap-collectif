<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\MediaBundle\Entity\Media;
use Capco\AppBundle\Form\DataTransformer\EntityToIdTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;

class MediaResponseType extends AbstractType
{
    protected $transformer;

    public function __construct(EntityToIdTransformer $transformer)
    {
        $this->transformer = $transformer;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $this->transformer->setEntityClass(AbstractQuestion::class);
        $this->transformer->setEntityRepository('CapcoAppBundle:Questions\AbstractQuestion');

        $builder
          ->add('question')
          ->add('medias', EntityType::class, [
              'class' => Media::class,
              'multiple' => true,
              // 'collection'
              // 'entry_type' => 'media_id_type',
              // 'allow_add' => true,
              // 'allow_delete' => true,
              // 'by_reference' => false,
          ])
        ;
        $builder->get('question')->addModelTransformer($this->transformer);

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
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }

    public function getBlockPrefix(): string
    {
        return 'media_response';
    }
}
