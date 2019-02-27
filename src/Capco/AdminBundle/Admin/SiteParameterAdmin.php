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
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'isEnabled'];

    public function toString($object)
    {
        if (!\is_object($object)) {
            return '';
        }

        if (method_exists($object, '__toString') && null !== $object->__toString()) {
            return $this->getConfigurationPool()
                ->getContainer()
                ->get('translator')
                ->trans((string) $object, [], 'CapcoAppBundle');
        }

        return parent::toString($object);
    }

    protected function getHelpText(?string $text = null): ?string
    {
        $txt = '';
        $translator = $this->getConfigurationPool()
            ->getContainer()
            ->get('translator');
        $texts = explode(' ', $text);
        if (\count($texts) > 1) {
            foreach ($texts as $splittedText) {
                $txt .= ' ' . $translator->trans($splittedText, [], 'CapcoAppBundle');
            }

            return $txt;
        }

        return $translator->trans($text, [], 'CapcoAppBundle');
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper->add('isEnabled', null, [
            'label' => 'admin.fields.site_parameter.is_enabled',
            'required' => false,
        ]);
        /** @var SiteParameter $subject */
        $subject = $this->getSubject();
        $types = SiteParameter::$types;

        if ($subject->getType() === $types['simple_text']) {
            $options = [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'help' => $this->getHelpText($subject->getHelpText()),
            ];
            if ($subject->isSocialNetworkDescription()) {
                $options['help'] = 'admin.help.metadescription';
                $options['attr']['max_length'] = 160;
            }
            $formMapper->add('value', TextType::class, $options);
        } elseif ($subject->getType() === $types['rich_text']) {
            $formMapper->add('value', CKEditorType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'config_name' => 'admin_editor',
                'help' => $this->getHelpText($subject->getHelpText()),
            ]);
        } elseif ($subject->getType() === $types['integer']) {
            $formMapper->add('value', IntegerType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'help' => $this->getHelpText($subject->getHelpText()),
            ]);
        } elseif ($subject->getType() === $types['javascript']) {
            $formMapper->add('value', TextareaType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'help' => $this->getHelpText($subject->getHelpText()),
                'attr' => [
                    'rows' => 10,
                    'placeholder' => '<script type="text/javascript"> </script>',
                ],
            ]);
        } elseif ($subject->getType() === $types['email']) {
            $formMapper->add('value', EmailType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'attr' => ['placeholder' => 'hello@exemple.com'],
                'help' => $this->getHelpText($subject->getHelpText()),
            ]);
        } elseif ($subject->getType() === $types['intern_url']) {
            $formMapper->add('value', null, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'help' => $this->getHelpText($subject->getHelpText()),
            ]);
        } elseif ($subject->getType() === $types['url']) {
            $formMapper->add('value', UrlType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'help' => $this->getHelpText($subject->getHelpText()),
            ]);
        } elseif ($subject->getType() === $types['tel']) {
            $formMapper->add('value', null, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'help' => $this->getHelpText($subject->getHelpText()),
            ]);
        } elseif ($subject->getType() === $types['boolean']) {
            $formMapper->add('value', ChoiceType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'translation_domain' => 'CapcoAppBundle',
                'choices' => ['global.enabled' => '1', 'global.disabled' => '0'],
                'help' => $this->getHelpText($subject->getHelpText()),
            ]);
        } elseif (
            'homepage.jumbotron.margin' === $subject->getKeyname() &&
            $subject->getType() === $types['select']
        ) {
            $formMapper->add('value', ChoiceType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'choices' => [
                    'Pas de marge (0px)' => 0,
                    'Petites marges (50px)' => 50,
                    'Marges par défaut (100px)' => 100,
                    'Grandes marges (150px)' => 150,
                    'Marges importantes (200px)' => 200,
                ],

                'help' => $this->getHelpText($subject->getHelpText()),
            ]);
        } elseif ('global.locale' === $subject->getKeyname()) {
            $formMapper->add('value', ChoiceType::class, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'choices' => ['Français' => 'fr-FR', 'English' => 'en-GB', 'Deutch' => 'de-DE'],
                'help' => $this->getHelpText($subject->getHelpText()),
            ]);
        } elseif ('global.timezone' === $subject->getKeyname()) {
            $formMapper->add('value', ChoiceType::class, [
                'label' => 'global.timezone',
                'required' => false,
                'choices' => $this->getTimezonesList(),
                'help' => $this->getHelpText($subject->getHelpText()),
            ]);
        } else {
            $formMapper->add('value', null, [
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'help' => $this->getHelpText($subject->getHelpText()),
            ]);
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['edit']);
    }

    private function getTimezonesList(): array
    {
        $timezones = \DateTimeZone::listIdentifiers(\DateTimeZone::ALL);
        $zones = [];

        foreach ($timezones as $zone) {
            $zones[$zone] = sprintf(
                '%s (GMT%s)',
                self::formatTimezoneName($zone),
                (new \DateTime('now', new \DateTimeZone($zone)))->format('P')
            );
        }

        return $zones;
    }

    private static function formatTimezoneName(string $name): string
    {
        return str_replace(['_', 'St '], [' ', 'St. '], $name);
    }
}
