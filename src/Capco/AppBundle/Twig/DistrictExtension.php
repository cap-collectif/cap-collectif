<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\DistrictRepository;

class DistrictExtension extends \Twig_Extension
{
    protected $districtRepo;

    public function __construct(DistrictRepository $districtRepo)
    {
        $this->districtRepo = $districtRepo;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('districts_list', [$this, 'listDistricts']),
        ];
    }

    public function listDistricts()
    {
        $districts = $this->districtRepo->findAll();
        $list = [];
        foreach ($districts as $district) {
            $list[] = [
              'id' => $district->getId(),
              'name' => $district->getName(),
              'geojson' => $district->getGeojson(),
            ];
        }

        usort($list, function ($a, $b) {
            return $a['name'] <=> $b['name'];
        });

        return $list;
    }
}
