'use client';

import { useEffect, useRef, useState } from 'react';
import Select from '@/components/ui/forms/Select';
import Input from './Input';

const BASE_URL = 'https://provinces.open-api.vn/api';

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
}

interface Ward {
  code: number;
  name: string;
}

interface Props {
  value?: string; // chuỗi địa chỉ hiện tại (để parse khi edit)
  onChange: (address: string) => void;
  label?: string;
}

function parseAddress(address: string) {
  // Định dạng: "Chi tiết, Xã/Phường, Quận/Huyện, Tỉnh/Thành phố"
  const parts = address.split(',').map((s) => s.trim());
  if (parts.length === 4) {
    return {
      detail: parts[0],
      ward: parts[1],
      district: parts[2],
      province: parts[3],
    };
  }
  return null;
}

export default function VietnamAddressSelect({
  value,
  onChange,
  label,
}: Props) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [provinceCode, setProvinceCode] = useState<number | ''>('');
  const [provinceName, setProvinceName] = useState('');
  const [districtCode, setDistrictCode] = useState<number | ''>('');
  const [districtName, setDistrictName] = useState('');
  const [wardName, setWardName] = useState('');
  const [detail, setDetail] = useState('');

  const lastEmitted = useRef('');

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load tỉnh/thành phố
  useEffect(() => {
    setLoadingProvinces(true);
    fetch(`${BASE_URL}/p/`)
      .then((r) => r.json())
      .then((data) => setProvinces(data))
      .catch(() => setProvinces([]))
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Khi có value (edit mode) và provinces đã load → thử tìm code
  useEffect(() => {
    if (!value || provinces.length === 0) return;
    if (value === lastEmitted.current) return; // bỏ qua nếu chính mình vừa emit
    const parsed = parseAddress(value);
    if (!parsed) return;

    const matchedProvince = provinces.find((p) => p.name === parsed.province);
    if (matchedProvince) {
      setProvinceCode(matchedProvince.code);
      setProvinceName(matchedProvince.name);
    }
    setDetail(parsed.detail || '');
  }, [value, provinces]);

  // Load quận/huyện khi chọn tỉnh
  useEffect(() => {
    if (provinceCode === '') {
      setDistricts([]);
      setDistrictCode('');
      setDistrictName('');
      setWards([]);
      setWardName('');
      return;
    }
    setLoadingDistricts(true);
    fetch(`${BASE_URL}/p/${provinceCode}?depth=2`)
      .then((r) => r.json())
      .then((data) => setDistricts(data.districts ?? []))
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistricts(false));
  }, [provinceCode]);

  // Khi districts load xong → tìm district từ parsed value
  useEffect(() => {
    if (!value || districts.length === 0) return;
    const parsed = parseAddress(value);
    if (!parsed) return;

    const matchedDistrict = districts.find((d) => d.name === parsed.district);
    if (matchedDistrict) {
      setDistrictCode(matchedDistrict.code);
      setDistrictName(matchedDistrict.name);
    }
  }, [districts, value]);

  // Load phường/xã khi chọn quận/huyện
  useEffect(() => {
    if (districtCode === '') {
      setWards([]);
      setWardName('');
      return;
    }
    setLoadingWards(true);
    fetch(`${BASE_URL}/d/${districtCode}?depth=2`)
      .then((r) => r.json())
      .then((data) => setWards(data.wards ?? []))
      .catch(() => setWards([]))
      .finally(() => setLoadingWards(false));
  }, [districtCode]);

  // Khi wards load xong → tìm ward từ parsed value
  useEffect(() => {
    if (!value || wards.length === 0) return;
    const parsed = parseAddress(value);
    if (!parsed) return;

    const matchedWard = wards.find((w) => w.name === parsed.ward);
    if (matchedWard) {
      setWardName(matchedWard.name);
    }
  }, [wards, value]);

  // Emit address string mỗi khi thay đổi
  useEffect(() => {
    if (!provinceName) return;
    const parts = [detail, wardName, districtName, provinceName].filter(
      Boolean,
    );
    const newAddress = parts.join(', ');
    lastEmitted.current = newAddress;
    onChange(newAddress);
  }, [detail, wardName, districtName, provinceName, onChange]);

  return (
    <div className="space-y-1">
      {/* Địa chỉ chi tiết */}
      <Input
        label="Số nhà / Đường (tùy chọn)"
        type="text"
        placeholder="VD: 123 Đường Lê Lợi"
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
      />

      <div className="flex gap-3">
        {/* Tỉnh / Thành phố */}
        <Select
          label={
            loadingProvinces
              ? 'Tỉnh / Thành phố (Đang tải...)'
              : 'Tỉnh / Thành phố'
          }
          className="flex-1"
          value={String(provinceCode)}
          disabled={loadingProvinces}
          options={provinces.map((p) => ({
            value: String(p.code),
            label: p.name,
          }))}
          onChange={(e) => {
            const code = Number(e.target.value);
            const name = provinces.find((p) => p.code === code)?.name ?? '';
            setProvinceCode(code || '');
            setProvinceName(name);
            setDistrictCode('');
            setDistrictName('');
            setWardName('');
          }}
        />

        {/* Quận / Huyện */}
        <Select
          label={
            loadingDistricts ? 'Quận / Huyện (Đang tải...)' : 'Quận / Huyện'
          }
          className="flex-1"
          value={String(districtCode)}
          disabled={provinceCode === '' || loadingDistricts}
          options={districts.map((d) => ({
            value: String(d.code),
            label: d.name,
          }))}
          onChange={(e) => {
            const code = Number(e.target.value);
            const name = districts.find((d) => d.code === code)?.name ?? '';
            setDistrictCode(code || '');
            setDistrictName(name);
            setWardName('');
          }}
        />

        {/* Phường / Xã */}
        <Select
          label={loadingWards ? 'Phường / Xã (Đang tải...)' : 'Phường / Xã'}
          className="flex-1"
          value={wardName}
          disabled={districtCode === '' || loadingWards}
          options={wards.map((w) => ({ value: w.name, label: w.name }))}
          onChange={(e) => setWardName(e.target.value)}
        />
      </div>
      {/* Preview */}
      {provinceName && (
        <p className="text-xs text-gray-400 italic">
          Địa chỉ:{' '}
          {[detail, wardName, districtName, provinceName]
            .filter(Boolean)
            .join(', ')}
        </p>
      )}
    </div>
  );
}
