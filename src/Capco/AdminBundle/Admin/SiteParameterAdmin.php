<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\SiteParameter;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;

class SiteParameterAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'isEnabled',
    ];

    public function toString($object)
    {
        if (!is_object($object)) {
            return '';
        }

        if (method_exists($object, '__toString') && null !== $object->__toString()) {
            return $this->getConfigurationPool()->getContainer()->get('translator')->trans((string) $object, [], 'CapcoAppBundle');
        }

        return parent::toString($object);
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('isEnabled', null, [
                'label' => 'admin.fields.site_parameter.is_enabled',
                'required' => false,
            ])
        ;

        $subject = $this->getSubject();
        $types = SiteParameter::$types;

        if ($subject->getType() === $types['simple_text']) {
            $options = [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ];
            if ($subject->isSocialNetworkDescription()) {
                $options['help'] = 'admin.help.metadescription';
                $options['max_length'] = 160;
            }
            $formMapper->add('value', TextType::class, $options);
        } elseif ($subject->getType() === $types['rich_text']) {
            $formMapper->add('value', CKEditorType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'config_name' => 'admin_editor',
            ]);
        } elseif ($subject->getType() === $types['integer']) {
            $formMapper->add('value', IntegerType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ]);
        } elseif ($subject->getType() === $types['javascript']) {
            $formMapper->add('value', TextareaType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'help' => 'global.site.embed_js' === $subject->getKeyname() ? 'admin.help.site_parameter.js' : 'admin.help.customcode',
                'attr' => ['rows' => 10, 'placeholder' => '<script type="text/javascript"> </script>'],
            ]);
        } elseif ($subject->getType() === $types['email']) {
            $formMapper->add('value', EmailType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'attr' => ['placeholder' => 'hello@exemple.com'],
            ]);
        } elseif ($subject->getType() === $types['intern_url']) {
            $formMapper->add('value', null, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ]);
        } elseif ($subject->getType() === $types['url']) {
            $formMapper->add('value', UrlType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ]);
        } elseif ($subject->getType() === $types['tel']) {
            $formMapper->add('value', null, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ]);
        } elseif ($subject->getType() === $types['boolean']) {
            $formMapper->add('value', ChoiceType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'choices' => ['1' => 'Activé', '0' => 'Désactivé'],
            ]);
        } elseif ('homepage.jumbotron.margin' === $subject->getKeyname() && $subject->getType() === $types['select']) {
            $formMapper->add('value', ChoiceType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'choices' => [
                    0 => 'Pas de marge (0px)',
                    50 => 'Petites marges (50px)',
                    100 => 'Marges par défaut (100px)',
                    150 => 'Grandes marges (150px)',
                    200 => 'Marges importantes (200px)',
                ],
            ]);
        } elseif ('global.locale' === $subject->getKeyname()) {
            $formMapper->add('value', ChoiceType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'choices' => [
                    'fr-FR' => 'Français',
                    'en-GB' => 'English',
                ],
            ]);
        } else {
            $formMapper->add('value', null, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ]);
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['edit']);
    }
}
